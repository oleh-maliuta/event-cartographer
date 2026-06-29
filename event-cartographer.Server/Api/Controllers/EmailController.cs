using EventCartographer.Api.Common;
using EventCartographer.Api.Models.Requests.Queries;
using EventCartographer.Application.Interfaces;
using EventCartographer.Domain.Entities;
using EventCartographer.Domain.ValueClasses;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Api.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController(
    ISender mediator,
    IApplicationDbContext db,
    ILocalizationService localizationService) : BaseController(mediator)
{
    private readonly IApplicationDbContext _db = db;
    private readonly ILocalizationService _localizationService = localizationService;

    [HttpGet]
    public async Task<IActionResult> ConfirmEmail(
        [FromQuery] ConfirmEmailQuery query)
    {
        User? user = await _db.Users.SingleOrDefaultAsync(
            x => x.Email == query.Email!);

        if (user == null)
        {
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale!),
                _localizationService.GetString("user-not-found", query.Locale!));
        }

        ActivationCode? activationCode = await _db.ActivationCodes
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
            _db.ActivationCodes.Remove(activationCode);
            await _db.SaveChangesAsync();
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
                _db.ActivationCodes.Remove(activationCode);
                break;
            case ActivationCodeActions.ChangeEmail:
                user.Email = actionInfo[1];
                user.LastActivityAt = DateTime.UtcNow;
                messageCode = "email-confirmed";
                _db.ActivationCodes.Remove(activationCode);
                break;
            case ActivationCodeActions.DeleteAccount:
                messageCode = "account-deleted";
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                _db.Users.Remove(user);
                break;
            default:
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", query.Locale!),
                    _localizationService.GetString("unknown-action", query.Locale!));
        }

        await _db.SaveChangesAsync();
        return MessageContentResult(
            true,
            _localizationService.GetString("success", query.Locale!),
            _localizationService.GetString(messageCode, query.Locale!));
    }
}
