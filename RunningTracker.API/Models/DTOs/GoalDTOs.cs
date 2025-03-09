using System.ComponentModel.DataAnnotations;

namespace RunningTracker.API.Models.DTOs
{
    public class GoalDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double TargetValue { get; set; }
        public double CurrentValue { get; set; }
        public GoalType GoalType { get; set; }
        public GoalTimeframe Timeframe { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCompleted { get; set; }
        public int? UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateGoalDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Target value must be greater than 0")]
        public double TargetValue { get; set; }
        
        [Required]
        [EnumDataType(typeof(GoalType))]
        public GoalType GoalType { get; set; }
        
        [Required]
        [EnumDataType(typeof(GoalTimeframe))]
        public GoalTimeframe Timeframe { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
    }

    public class UpdateGoalDTO
    {
        [StringLength(100)]
        public string? Name { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Range(0.01, double.MaxValue, ErrorMessage = "Target value must be greater than 0")]
        public double? TargetValue { get; set; }
        
        public GoalType? GoalType { get; set; }
        
        public GoalTimeframe? Timeframe { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public double? CurrentValue { get; set; }
        
        public bool? IsCompleted { get; set; }
    }
} 