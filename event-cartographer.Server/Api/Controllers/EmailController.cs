using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.ValueClasses;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController(
        IApplicationDbContext db,
        ILocalizationService localizationService) : BaseController(db)
{
    private readonly ILocalizationService _localizationService = localizationService;

    [HttpGet]
    public async Task<IActionResult> ConfirmEmail(
        [FromQuery] ConfirmEmailQuery query)
    {
        User? user = await DB.Users.SingleOrDefaultAsync(
            x => x.Email == query.Email!);

        if (user == null)
        {
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale!),
                _localizationService.GetString("user-not-found", query.Locale!));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Id == query.Token);

        if (activationCode == null)
        {
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale!),
                _localizationService.GetString("link-issue", query.Locale!));
        }

        if (DateTime.UtcNow > activationCode.ExpiresAt)
        {
            DB.ActivationCodes.Remove(activationCode);
            await DB.SaveChangesAsync();
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale!),
                _localizationService.GetString("link-issue", query.Locale!));
        }

        string[] actionInfo = activationCode.Action.Split(',');
        string messageCode;

        switch (actionInfo[0])
        {
            case ActivationCodeActions.Register:
                user.IsActivated = true;
                user.LastActivityAt = DateTime.UtcNow;
                messageCode = "registration-completed";
                DB.ActivationCodes.Remove(activationCode);
                break;
            case ActivationCodeActions.ChangeEmail:
                user.Email = actionInfo[1];
                user.LastActivityAt = DateTime.UtcNow;
                messageCode = "email-confirmed";
                DB.ActivationCodes.Remove(activationCode);
                break;
            case ActivationCodeActions.DeleteAccount:
                messageCode = "account-deleted";
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                DB.Users.Remove(user);
                break;
            default:
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", query.Locale!),
                    _localizationService.GetString("unknown-action", query.Locale!));
        }

        await DB.SaveChangesAsync();
        return MessageContentResult(
            true,
            _localizationService.GetString("success", query.Locale!),
            _localizationService.GetString(messageCode, query.Locale!));
    }
}
