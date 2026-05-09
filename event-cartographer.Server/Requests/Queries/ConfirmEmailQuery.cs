using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using EventCartographer.Server.Utils;

namespace EventCartographer.Server.Requests.Queries
{
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
                    field = Constants.DEFAULT_LOCALE;
                    return;
                }

                field = Constants.LOCALES.Contains(temp)
                    ? temp : Constants.DEFAULT_LOCALE;
            }
        }
        [FromQuery(Name = "token")]
        public string? Token { get; set; }
    }
}
