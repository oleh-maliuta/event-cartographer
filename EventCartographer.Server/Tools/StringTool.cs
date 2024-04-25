using System.Text;

namespace EventCartographer.Server.Tools
{
    public static class StringTool
    {
        public static string Transliterate(string input)
        {
            Dictionary<char, string> transliterationMap = new()
        {
            // Ukrainian Cyrillic to Latin characters mapping
            { 'А', "A" }, { 'а', "a" },
            { 'Б', "B" }, { 'б', "b" },
            { 'В', "V" }, { 'в', "v" },
            { 'Г', "H" }, { 'г', "h" },
            { 'Ґ', "G" }, { 'ґ', "g" },
            { 'Д', "D" }, { 'д', "d" },
            { 'Е', "E" }, { 'е', "e" },
            { 'Є', "Ye" }, { 'є', "ie" },
            { 'Ж', "Zh" }, { 'ж', "zh" },
            { 'З', "Z" }, { 'з', "z" },
            { 'И', "Y" }, { 'и', "y" },
            { 'І', "I" }, { 'і', "i" },
            { 'Ї', "Yi" }, { 'ї', "i" },
            { 'Й', "Y" }, { 'й', "i" },
            { 'К', "K" }, { 'к', "k" },
            { 'Л', "L" }, { 'л', "l" },
            { 'М', "M" }, { 'м', "m" },
            { 'Н', "N" }, { 'н', "n" },
            { 'О', "O" }, { 'о', "o" },
            { 'П', "P" }, { 'п', "p" },
            { 'Р', "R" }, { 'р', "r" },
            { 'С', "S" }, { 'с', "s" },
            { 'Т', "T" }, { 'т', "t" },
            { 'У', "U" }, { 'у', "u" },
            { 'Ф', "F" }, { 'ф', "f" },
            { 'Х', "Kh" }, { 'х', "kh" },
            { 'Ц', "Ts" }, { 'ц', "ts" },
            { 'Ч', "Ch" }, { 'ч', "ch" },
            { 'Ш', "Sh" }, { 'ш', "sh" },
            { 'Щ', "Shch" }, { 'щ', "shch" },
            { 'Ю', "Yu" }, { 'ю', "iu" },
            { 'Я', "Ya" }, { 'я', "ia" }
        };

            StringBuilder latinTextBuilder = new();

            foreach (char c in input)
            {
                latinTextBuilder.Append(transliterationMap.ContainsKey(c) ? transliterationMap[c] : c);
            }

            return latinTextBuilder.ToString();
        }

        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
            Random random = new();
            return new string(Enumerable.Repeat(chars, length)
                             .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
