FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["ElectroPi.TaskManager.Api/ElectroPi.TaskManager.Api.csproj", "ElectroPi.TaskManager.Api/"]
COPY ["ElectroPi.TaskManager.Application/ElectroPi.TaskManager.Application.csproj", "ElectroPi.TaskManager.Application/"]
COPY ["ElectroPi.TaskManager.Domain/ElectroPi.TaskManager.Domain.csproj", "ElectroPi.TaskManager.Domain/"]
COPY ["ElectroPi.TaskManager.Infrastructure/ElectroPi.TaskManager.Infrastructure.csproj", "ElectroPi.TaskManager.Infrastructure/"]

RUN dotnet restore "ElectroPi.TaskManager.Api/ElectroPi.TaskManager.Api.csproj"

COPY . .

WORKDIR "/src/ElectroPi.TaskManager.Api"

RUN dotnet publish "ElectroPi.TaskManager.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ElectroPi.TaskManager.Api.dll"]