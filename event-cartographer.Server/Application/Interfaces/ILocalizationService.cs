namespace EventCartographer.Application.Interfaces;

public interface ILocalizationService
{
    string GetString(string key, string languageCode = "en");
}
