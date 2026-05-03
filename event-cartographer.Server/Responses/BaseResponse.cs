using System.Text.Json.Serialization;

namespace EventCartographer.Server.Responses
{
    public abstract class BaseResponse(bool success, string? message, object? data)
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; } = success;
        [JsonPropertyName("message")]
        public string? Message { get; set; } = message;
        [JsonPropertyName("data")]
        public object? Data { get; set; } = data;

        public class SuccessResponse : BaseResponse
        {
            public SuccessResponse(string? message, object? data = null) : base(true, message, data)
            {
            }

            public SuccessResponse(object data) : base(true, null, data)
            {
            }
        }

        public class ErrorResponse(string? message, object? data = null) : BaseResponse(false, message, data)
        {
        }
    }
}
