import React from 'react';
import { ExpertCard } from '../components/ExpertCard';
import type { ExpertProfile } from '@contra/types';

// Framer types - these will be available when running in Framer
declare const addPropertyControls: any;
declare const ControlType: any;

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 380
 * @framerIntrinsicHeight 500
 */
export function ExpertCardFramer(props: any) {
  // Create mock expert data from props or use default
  const expert: ExpertProfile = {
    id: props.expertId || 'demo-expert',
    name: props.name || 'Jane Smith',
    avatarUrl: props.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    location: props.location || 'San Francisco, CA',
    oneLiner: props.bio || 'Full-stack developer specializing in React and Node.js',
    available: props.available ?? true,
    profileUrl: props.profileUrl || '#',
    inquiryUrl: props.inquiryUrl || '#',
    hourlyRateUSD: props.hourlyRate || 150,
    earningsUSD: props.earnings || 75000,
    projectsCompletedCount: props.projectsCompleted || 24,
    followersCount: props.followers || 342,
    reviewsCount: props.reviews || 18,
    averageReviewScore: props.rating || 4.8,
    skillTags: props.skills || ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    socialLinks: [],
    projects: props.showProjects ? [
      {
        title: 'E-commerce Platform',
        projectUrl: '#',
        coverUrl: props.project1Image || 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Project+1',
      },
      {
        title: 'SaaS Dashboard',
        projectUrl: '#',
        coverUrl: props.project2Image || 'https://via.placeholder.com/400x300/10b981/ffffff?text=Project+2',
      },
      {
        title: 'Mobile App',
        projectUrl: '#',
        coverUrl: props.project3Image || 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Project+3',
      },
      {
        title: 'Marketing Site',
        projectUrl: '#',
        coverUrl: props.project4Image || 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Project+4',
      },
    ] : [],
  };

  return (
    <ExpertCard
      expert={expert}
      layout={props.layout}
      showProjects={props.showProjects}
      maxProjects={props.maxProjects}
      showStats={props.showStats}
      showAvailability={props.showAvailability}
      showRate={props.showRate}
      showActions={props.showActions}
      style={props.style}
    />
  );
}

// Add Framer property controls if available
if (addPropertyControls && ControlType) {
  addPropertyControls(ExpertCardFramer, {
    // Expert Information
    name: {
      type: ControlType.String,
      title: "Name",
      defaultValue: "Jane Smith",
    },
    avatarUrl: {
      type: ControlType.ResponsiveImage,
      title: "Avatar",
    },
    location: {
      type: ControlType.String,
      title: "Location",
      defaultValue: "San Francisco, CA",
    },
    bio: {
      type: ControlType.String,
      title: "Bio",
      defaultValue: "Full-stack developer specializing in React and Node.js",
      displayTextArea: true,
    },
    available: {
      type: ControlType.Boolean,
      title: "Available",
      defaultValue: true,
    },
    
    // Stats
    hourlyRate: {
      type: ControlType.Number,
      title: "Hourly Rate",
      defaultValue: 150,
      min: 0,
      max: 1000,
      step: 10,
      displayStepper: true,
    },
    earnings: {
      type: ControlType.Number,
      title: "Total Earnings",
      defaultValue: 75000,
      min: 0,
      step: 1000,
    },
    projectsCompleted: {
      type: ControlType.Number,
      title: "Projects Completed",
      defaultValue: 24,
      min: 0,
      step: 1,
    },
    followers: {
      type: ControlType.Number,
      title: "Followers",
      defaultValue: 342,
      min: 0,
      step: 1,
    },
    reviews: {
      type: ControlType.Number,
      title: "Reviews",
      defaultValue: 18,
      min: 0,
      step: 1,
    },
    rating: {
      type: ControlType.Number,
      title: "Rating",
      defaultValue: 4.8,
      min: 0,
      max: 5,
      step: 0.1,
      displayStepper: true,
    },
    
    // Display Options
    layout: {
      type: ControlType.Enum,
      title: "Layout",
      options: ["vertical", "horizontal"],
      optionTitles: ["Vertical", "Horizontal"],
      defaultValue: "vertical",
    },
    showProjects: {
      type: ControlType.Boolean,
      title: "Show Projects",
      defaultValue: true,
    },
    maxProjects: {
      type: ControlType.Number,
      title: "Max Projects",
      defaultValue: 4,
      min: 1,
      max: 8,
      step: 1,
      hidden: (props: any) => !props.showProjects,
    },
    showStats: {
      type: ControlType.Boolean,
      title: "Show Stats",
      defaultValue: true,
    },
    showAvailability: {
      type: ControlType.Boolean,
      title: "Show Availability",
      defaultValue: true,
    },
    showRate: {
      type: ControlType.Boolean,
      title: "Show Rate",
      defaultValue: true,
    },
    showActions: {
      type: ControlType.Boolean,
      title: "Show Actions",
      defaultValue: true,
    },
    
    // Project Images (only show if showProjects is true)
    project1Image: {
      type: ControlType.ResponsiveImage,
      title: "Project 1 Image",
      hidden: (props: any) => !props.showProjects,
    },
    project2Image: {
      type: ControlType.ResponsiveImage,
      title: "Project 2 Image",
      hidden: (props: any) => !props.showProjects,
    },
    project3Image: {
      type: ControlType.ResponsiveImage,
      title: "Project 3 Image",
      hidden: (props: any) => !props.showProjects,
    },
    project4Image: {
      type: ControlType.ResponsiveImage,
      title: "Project 4 Image",
      hidden: (props: any) => !props.showProjects,
    },
  });
} 