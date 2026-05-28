using EventCartographer.Server.Requests.Queries;

namespace EventCartographer.Server.Responses;

public class PageResponse<T> : BaseResponse
    where T : class
{
    public PageResponse(ICollection<T> items, int pageIndex, int pageSize, int pageCount) : base(true, null, null)
    {
        Data = new View<T>(items, pageIndex, pageSize, pageCount);
    }

    public PageResponse(ICollection<T> items, PageQuery query, int pageCount) : base(true, null, null)
    {
        Data = new View<T>(items, query.Page, query.PageSize, pageCount);
    }

    public class View<O>(ICollection<O> items, int pageIndex, int pageSize, int pageCount)
        where O : class
    {
        public int PageIndex { get; set; } = pageIndex;
        public int PageSize { get; set; } = pageSize;
        public int PageCount { get; set; } = pageCount;

        public ICollection<O> Items { get; set; } = items;
    }
}
