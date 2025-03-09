using System.ComponentModel.DataAnnotations;

namespace RunningTracker.API.Models
{
    public class Goal : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public double TargetValue { get; set; }
        
        public double CurrentValue { get; set; }
        
        [Required]
        public GoalType GoalType { get; set; }
        
        [Required]
        public GoalTimeframe Timeframe { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public bool IsCompleted { get; set; }
        
        // Foreign key
        public int? UserId { get; set; }
        
        // Navigation property
        public User? User { get; set; }
    }
    
    public enum GoalType
    {
        TotalDistance,
        TotalActivities,
        AveragePace,
        LongestRun,
        FastestPace
    }
    
    public enum GoalTimeframe
    {
        Weekly,
        Monthly,
        Yearly,
        Custom
    }
} 