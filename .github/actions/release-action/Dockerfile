# Set the base image as the .NET 6.0 SDK (this includes the runtime)
FROM mcr.microsoft.com/dotnet/sdk:6.0 as build-env

# Copy everything and publish the release (publish implicitly restores and builds)
COPY . ./
RUN dotnet publish ./ReleaseAction.csproj -c Release -o out --no-self-contained

# Label the container
LABEL maintainer="Vimal Sivasubramanian <vimal.sivasubramanian@maersk.com>"
LABEL repository="https://github.com/Maersk-Global/rock"
LABEL homepage="https://github.com/Maersk-Global/rock"

# Label as GitHub action
LABEL com.github.actions.name="Release Action"
LABEL com.github.actions.description="A Github action that deploys the components based on the sequence defined in components-json file."
LABEL com.github.actions.icon="sliders"
LABEL com.github.actions.color="purple"

# Relayer the .NET SDK, anew with the build output
FROM mcr.microsoft.com/dotnet/sdk:6.0
COPY --from=build-env /out .
ENTRYPOINT [ "dotnet", "/ReleaseAction.dll" ]