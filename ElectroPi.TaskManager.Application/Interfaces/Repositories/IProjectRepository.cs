using ElectroPi.TaskManager.Domain.Entities;

namespace ElectroPi.TaskManager.Application.Interfaces.Repositories;

public interface IProjectRepository
{
    Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken cancellationToken);
    Task<Project?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<Project?> GetByIdWithTasksAsync(int id, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> HasTasksAsync(int id, CancellationToken cancellationToken);
    Task<Project> AddAsync(Project project, CancellationToken cancellationToken);
    Task UpdateAsync(Project project, CancellationToken cancellationToken);
    Task DeleteAsync(Project project, CancellationToken cancellationToken);
}
