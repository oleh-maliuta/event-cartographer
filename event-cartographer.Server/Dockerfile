FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8081


FROM mcr.microsoft.com/dotnet/sdk:10.0 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash
RUN apt-get -y install nodejs


FROM with-node AS build
WORKDIR /src
COPY ["event-cartographer.Server/event-cartographer.Server.csproj", "event-cartographer.Server/"]
COPY ["event-cartographer.client/event-cartographer.client.esproj", "event-cartographer.client/"]
RUN dotnet restore "./event-cartographer.Server/event-cartographer.Server.csproj"
COPY . .

WORKDIR "/src/event-cartographer.Server"
RUN dotnet build "./event-cartographer.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "./event-cartographer.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=publish /src/event-cartographer.Server/Locales ./Locales
ENTRYPOINT ["dotnet", "event-cartographer.Server.dll"]
