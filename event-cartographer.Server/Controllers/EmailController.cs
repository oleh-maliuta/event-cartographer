using EventCartographer.Server.Models;
using EventCartographer.Server.Requests.Queries;
using EventCartographer.Server.Services.EntityFramework;
using EventCartographer.Server.Services.Localization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventCartographer.Server.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController(
        DbApp db,
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
                _localizationService.GetString("fail", query.Locale ?? "en"),
                _localizationService.GetString("user-not-found", query.Locale ?? "en"));
        }

        ActivationCode? activationCode = await DB.ActivationCodes
            .SingleOrDefaultAsync(x => user.Id == x.UserId && x.Id == query.Token);

        if (activationCode == null)
        {
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale ?? "en"),
                _localizationService.GetString("link-issue", query.Locale ?? "en"));
        }

        if (DateTime.UtcNow > activationCode.ExpiresAt)
        {
            DB.ActivationCodes.Remove(activationCode);
            await DB.SaveChangesAsync();
            return MessageContentResult(
                false,
                _localizationService.GetString("fail", query.Locale ?? "en"),
                _localizationService.GetString("link-issue", query.Locale ?? "en"));
        }

        string[] actionInfo = activationCode.Action.Split(',');
        string messageCode;

        switch (actionInfo[0])
        {
            case "confirm-registration":
                user.IsActivated = true;
                user.LastActivityAt = DateTime.UtcNow;
                messageCode = "registration-completed";
                DB.ActivationCodes.Remove(activationCode);
                break;
            case "change-email":
                user.Email = actionInfo[1];
                user.LastActivityAt = DateTime.UtcNow;
                messageCode = "email-confirmed";
                DB.ActivationCodes.Remove(activationCode);
                break;
            case "delete-user":
                messageCode = "account-deleted";
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                DB.Users.Remove(user);
                break;
            default:
                return MessageContentResult(
                    false,
                    _localizationService.GetString("fail", query.Locale ?? "en"),
                    _localizationService.GetString("unknown-action", query.Locale ?? "en"));
        }

        await DB.SaveChangesAsync();
        return MessageContentResult(
            true,
            _localizationService.GetString("success", query.Locale ?? "en"),
            _localizationService.GetString(messageCode, query.Locale ?? "en"));
    }
}
