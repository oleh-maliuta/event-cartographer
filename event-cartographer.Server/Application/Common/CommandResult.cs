namespace EventCartographer.Application.Common;

public record CommandResult<T>(
    bool IsSuccess,
    int StatusCode,
    T? Data,
    string? ErrorMessage = null)
{
    public static CommandResult<T> Success(T data, int statusCode = -1) =>
        new(true, statusCode, data);
    public static CommandResult<T> Failure(string errorMsg, int statusCode = -1) =>
        new(false, statusCode, default, errorMsg);
}
