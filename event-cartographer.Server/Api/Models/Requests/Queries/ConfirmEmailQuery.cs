using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using EventCartographer.Domain.Constants;

namespace EventCartographer.Api.Models.Requests.Queries;

public class ConfirmEmailQuery
{
    [Required]
    [EmailAddress]
    [FromQuery(Name = "email")]
    public string? Email
    {
        get;
        set => field = value?.Trim().ToLower();
    }
    [FromQuery(Name = "locale")]
    public string? Locale
    {
        get;
        set
        {
            string temp = value?.Trim().ToLower() ?? "";

            if (temp == "")
            {
                field = LocaleConstants.DefaultLocale;
                return;
            }

            field = LocaleConstants.Locales.Contains(temp)
                ? temp : LocaleConstants.DefaultLocale;
        }
    }
    [FromQuery(Name = "token")]
    public Guid? Token { get; set; }
}
