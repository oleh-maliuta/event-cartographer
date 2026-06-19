using System.Text.RegularExpressions;

namespace EventCartographer.Application.Common.Helpers;

public static partial class EmailSubjectParser
{
    [GeneratedRegex(@"<meta\s+name=""subject""\s+content=""(?<subject>[^""]*)""", RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 500)]
    public static partial Regex EmailSubjectRegex();

    public static string ExtractSubject(string template)
    {
        if (string.IsNullOrWhiteSpace(template))
            throw new ArgumentException("Email subject template is empty.");

        Match match = EmailSubjectRegex().Match(template);
        return match.Success
            ? match.Groups["subject"].Value
            : throw new ArgumentException("Email subject template is invalid."); ;
    }
}
