using Microsoft.AspNetCore.Mvc;
using EventCartographer.Domain.Common;

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
                field = Constants.DEFAULT_LOCALE;
                return;
            }

            field = Constants.LOCALES.Contains(temp)
                ? temp : Constants.DEFAULT_LOCALE;
        }
    }
}
