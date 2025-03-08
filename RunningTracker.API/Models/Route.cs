using System.ComponentModel.DataAnnotations;

namespace RunningTracker.API.Models
{
    public class RunningRoute : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Distance must be greater than 0")]
        public double Distance { get; set; } // in kilometers
        
        public string? StartLocation { get; set; }
        
        public string? EndLocation { get; set; }
        
        public bool IsLoop { get; set; } // Whether the route ends where it starts
        
        public string? RouteData { get; set; } // JSON data for route coordinates
        
        public double? ElevationGain { get; set; } // in meters
        
        public double? ElevationLoss { get; set; } // in meters
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        public ICollection<RunningActivity> RunningActivities { get; set; } = new List<RunningActivity>();
    }
} 