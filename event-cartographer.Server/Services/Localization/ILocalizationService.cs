namespace EventCartographer.Services.Localization;

public interface ILocalizationService
{
    string GetString(string key, string languageCode = "en");
}
