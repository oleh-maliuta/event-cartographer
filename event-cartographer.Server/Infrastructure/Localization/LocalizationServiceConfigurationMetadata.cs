using EventCartographer.Domain.Constants;

namespace EventCartographer.Infrastructure.Localization;

public class LocalizationServiceConfigurationMetadata
{
    public string DefaultLanguage { get; set; } = LocaleConstants.DefaultLocale;
    public string[] StringsPath { get; set; } = ["Api", "Views", "Strings"];
}
