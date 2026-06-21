using EventCartographer.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace EventCartographer.Api.Models.Requests.Queries;

public class LocaleQuery
{
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
}
