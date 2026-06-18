namespace EventCartographer.Infrastructure.Localization;

public class LocalizationServiceConfigurationMetadata
{
    public string DefaultLanguage { get; set; } = "en";
    public string[] StringsPath { get; set; } = ["Api", "Locales", "Strings"];
}
