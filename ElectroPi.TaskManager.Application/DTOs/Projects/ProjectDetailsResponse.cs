using ElectroPi.TaskManager.Application.DTOs.Tasks;

namespace ElectroPi.TaskManager.Application.DTOs.Projects;

public sealed class ProjectDetailsResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
    public IReadOnlyList<TaskItemResponse> Tasks { get; init; } = [];
}
