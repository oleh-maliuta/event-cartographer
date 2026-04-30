namespace EventCartographer.Server.Services.Localization
{
    public class LocalizationServiceConfigurationMetadata
    {   public string DefaultLanguage { get; set; } = "en";
        public string[] StringsPath { get; set; } = ["Locales", "Strings"];
    }
}
