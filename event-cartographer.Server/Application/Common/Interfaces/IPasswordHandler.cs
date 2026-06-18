namespace EventCartographer.Application.Common.Interfaces;

public interface IPasswordHandler
{
    string Hash(string password);
    bool Validate(string password, string passwordHash);
    bool CheckFormat(string password);
}
