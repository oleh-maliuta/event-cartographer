using Microsoft.Extensions.Options;
using System.Text.Json;

namespace EventCartographer.Server.Services.Localization
{
    public class LocalizationService : ILocalizationService
    {
        private readonly LocalizationServiceConfigurationMetadata configuration;
        private readonly string StringsPath;

        public LocalizationService(IOptions<LocalizationServiceConfigurationMetadata> configuration)
        {
            this.configuration = configuration.Value;
            string combinedPath = Path.Combine(configuration.Value.StringsPath);
            StringsPath = Path.IsPathRooted(combinedPath)
                ? combinedPath
                : Path.Combine(Directory.GetCurrentDirectory(), combinedPath);
        }

        public string GetString(string key, string languageCode = "en")
        {
            string path = Path.Combine(StringsPath, $"{languageCode}.json");
            if (!File.Exists(path))
            {
                path = Path.Combine(StringsPath, $"{configuration.DefaultLanguage}.json");
            }

            string json = File.ReadAllText(path);
            var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            if (dict != null && dict.TryGetValue(key, out var value) && value != null)
            {
                return value;
            }
            return key;
        }
    }
}
