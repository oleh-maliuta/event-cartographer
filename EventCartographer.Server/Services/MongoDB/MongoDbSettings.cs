namespace EventCartographer.Server.Services.MongoDB
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string ActivationCodeCollectionName { get; set; } = null!;
        public string UserCollectionName { get; set; } = null!;
        public string MarkerCollectionName { get; set; } = null!;
    }
}
