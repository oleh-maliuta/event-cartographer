using System.Text.Json.Serialization;

namespace EventCartographer.Server.Responses
{
    public class ListResponse<T> : BaseResponse
    {
        public ListResponse(List<T> data, string? message) : base(true, message, data) {}
    }
}
