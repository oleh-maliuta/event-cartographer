namespace EventCartographer.Server.Utils
{
    public static class StringTool
    {
        private static readonly string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        private static readonly Random _random = new();

        public static async Task<string> RandomTokenAsync(
            int length,
            Func<string, Task<bool>> existsInDatabase)
        {
            string token;

            do {
                token = new string([..
                    Enumerable.Repeat(chars, length)
                    .Select(x => x[_random.Next(x.Length)])]);
            } while (await existsInDatabase(token));

            return token;
        }
    }
}
