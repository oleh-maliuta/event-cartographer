namespace EventCartographer.Application.Common.Interfaces;

public interface ILocalizationService
{
    string GetString(string key, string languageCode = "en");
}
