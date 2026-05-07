FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["BillGeneratorApi/BillGeneratorApi.csproj", "BillGeneratorApi/"]
RUN dotnet restore "BillGeneratorApi/BillGeneratorApi.csproj"
COPY BillGeneratorApi/ BillGeneratorApi/
RUN dotnet publish "BillGeneratorApi/BillGeneratorApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BillGeneratorApi.dll"]
