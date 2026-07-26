using ElectroPi.TaskManager.Application.DTOs.Projects;

namespace ElectroPi.TaskManager.Application.Interfaces.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProjectDetailsResponse> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<ProjectResponse> CreateAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken);

    Task UpdateAsync(
        int id,
        UpdateProjectRequest request,
        CancellationToken cancellationToken);

    Task DeleteAsync(int id, CancellationToken cancellationToken);
}
