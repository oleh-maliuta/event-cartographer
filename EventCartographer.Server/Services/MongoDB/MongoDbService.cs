using EventCartographer.Server.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace EventCartographer.Server.Services.MongoDB
{
    public class MongoDbService
    {
        public IMongoCollection<ActivationCode> ActivationCodes { get; }
        public IMongoCollection<User> Users { get; }
        public IMongoCollection<Marker> Markers { get; }

        public MongoDbService(IOptions<MongoDbSettings> dbSettings)
        {
            MongoClient mongoClient = new(dbSettings.Value.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(dbSettings.Value.DatabaseName);

            CreateCollectionIfDoesntExist(mongoDatabase, dbSettings.Value.UserCollectionName);
            Users = mongoDatabase.GetCollection<User>(dbSettings.Value.UserCollectionName);

            CreateCollectionIfDoesntExist(mongoDatabase, dbSettings.Value.MarkerCollectionName);
            Markers = mongoDatabase.GetCollection<Marker>(dbSettings.Value.MarkerCollectionName);

            CreateCollectionIfDoesntExist(mongoDatabase, dbSettings.Value.ActivationCodeCollectionName);
            ActivationCodes = mongoDatabase.GetCollection<ActivationCode>(dbSettings.Value.ActivationCodeCollectionName);
        }

        private static void CreateCollectionIfDoesntExist(IMongoDatabase database, string collectionName)
        {
            BsonDocument filter = new("name", collectionName);
            IAsyncCursor<BsonDocument> collections = database.ListCollections(
                new ListCollectionsOptions { Filter = filter });

            if (!collections.Any())
            {
                database.CreateCollection(collectionName);
            }
        }
    }
}
