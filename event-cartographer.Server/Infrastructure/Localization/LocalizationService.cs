using EventCartographer.Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using System.Collections.Concurrent;
using System.Text.Json;

namespace EventCartographer.Infrastructure.Localization;

public class LocalizationService : ILocalizationService
{
    private readonly LocalizationServiceConfigurationMetadata _configuration;
    private readonly string _stringsPath;

    private readonly ConcurrentDictionary<string, Dictionary<string, string>> _cache = new();

    public LocalizationService(IOptions<LocalizationServiceConfigurationMetadata> configuration)
    {
        _configuration = configuration.Value;
        string combinedPath = Path.Combine(_configuration.StringsPath);

        _stringsPath = Path.IsPathRooted(combinedPath)
            ? combinedPath
            : Path.Combine(Directory.GetCurrentDirectory(), combinedPath);
    }

    public string GetString(string key, string languageCode = "en")
    {
        var dictionary = GetOrLoadLanguage(languageCode);

        if (!dictionary.TryGetValue(key, out string? value) || value == null)
        {
            if (languageCode != _configuration.DefaultLanguage)
            {
                var defaultDictionary = GetOrLoadLanguage(_configuration.DefaultLanguage);
                if (defaultDictionary.TryGetValue(key, out string? defaultValue) && defaultValue != null)
                    return defaultValue;
            }

            return key;
        }

        return value;
    }

    private Dictionary<string, string> GetOrLoadLanguage(string languageCode)
    {
        return _cache.GetOrAdd(languageCode, code =>
        {
            string path = Path.Combine(_stringsPath, $"{code}.json");

            if (!File.Exists(path))
                path = Path.Combine(_stringsPath, $"{_configuration.DefaultLanguage}.json");
            if (!File.Exists(path))
                return [];

            string json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? [];
        });
    }
}
