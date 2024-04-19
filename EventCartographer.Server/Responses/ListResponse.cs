using System.Text.Json.Serialization;

namespace EventCartographer.Server.Responses
{
    public class ListResponse<T> : BaseResponse
    {
        public ListResponse(List<T> data)
            : base(true, null, data) {}
    }
}
