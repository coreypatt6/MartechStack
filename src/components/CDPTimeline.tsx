import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, TrendingUp, Users, Database, Shield, Target, Zap } from 'lucide-react';

interface TimelineEvent {
  id: string;
  period: string;
  title: string;
  description: string;
  category: 'foundation' | 'inception' | 'expansion' | 'maturity' | 'advanced' | 'future';
  dataPoints?: string[];
  channels?: string[];
  capabilities?: string[];
  metrics?: string[];
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const timelineData: TimelineEvent[] = [
  {
    id: 'pre-2018',
    period: 'Pre-2018',
    title: 'Foundational Data Collection',
    description: 'Initial data collection systems across various game titles, support, e-commerce, and marketing touchpoints, though not yet unified into a comprehensive CDP.',
    category: 'foundation',
    icon: Database,
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: '2018',
    period: '2018',
    title: 'CDP Inception - Opportunity & Implementation',
    description: 'Take-Two recognizes the need for a unified customer data platform with focus on privacy alignment and advertising activation.',
    category: 'inception',
    dataPoints: [
      'Opportunity Identified',
      'Internal Discovery',
      'Vendor Discovery',
      'Proof of Concept',
      'Privacy Alignment',
      'Prioritize Advertising Activation'
    ],
    icon: Target,
    gradient: 'from-blue-600 to-blue-800'
  },
  {
    id: 'fy20',
    period: 'FY20 (Q2 2019 - Q1 2020)',
    title: 'Initial CDP Data Feeds & Channels',
    description: 'Major expansion of data feeds and channels with early audience segmentation capabilities.',
    category: 'expansion',
    dataPoints: [
      'Zendesk Data', 'RDO', 'RDR2', 'GTAO', 'Social Club', 'GTAV',
      'E-commerce Store', 'Email Engagement', 'LiveOps campaigns'
    ],
    channels: ['Twitter', 'Google Adwords', 'Facebook', 'Instagram'],
    capabilities: ['Audience Segmentation'],
    icon: Users,
    gradient: 'from-green-600 to-green-800'
  },
  {
    id: 'fy20-q4',
    period: 'FY20 Q4 (Q1 2020)',
    title: 'Further Data & Channels Expansion',
    description: 'Continued expansion with new data feeds and additional marketing channels.',
    category: 'expansion',
    dataPoints: [
      'NBA 2K20', 'BL3', 'WWE 2K20', 'GTA Item Ownership',
      'Title Registration (Max Payne 3, GTA IV, RDR, Bully)'
    ],
    channels: ['Snapchat', 'Google DCM', 'Email - Newswire', 'Samsung'],
    icon: TrendingUp,
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 'fy21',
    period: 'FY21 (Q2 2020 - Q1 2021)',
    title: 'Expanding Identity & Activation',
    description: 'Major milestone with significant data volume and advanced capabilities including audience activation and attribution.',
    category: 'maturity',
    dataPoints: [
      'Mobile Identities', '2K Mobile', 'XCOM Switch', 'Bioshock Switch', 'NBA 2K21'
    ],
    channels: ['Google DV 360', 'Facebook S2S', 'Google SSD', 'Web'],
    capabilities: [
      'Audience Activation', 'PIA Unification', 'X-Label ID enrichment',
      'Attribution (London Bridge)', 'Player Unification', 'Email Activation'
    ],
    metrics: [
      '>300 Billion behaviors',
      '>515 Million player accounts',
      '408 Million players'
    ],
    icon: Zap,
    gradient: 'from-orange-600 to-orange-800'
  },
  {
    id: 'fy21-q3',
    period: 'FY21 Q3 (Q4 2020)',
    title: 'Increased Attribution & Integration',
    description: 'Enhanced attribution capabilities and deeper integration with third-party platforms.',
    category: 'maturity',
    dataPoints: [
      'NBA 2K21 NG', 'BL3 NG', 'GTA Archetypes', 'RDO Standalone', 'DNA Membership'
    ],
    channels: ['Twitch', 'Amazon', 'Liveramp', 'Dropbox', 'Reddit'],
    capabilities: [
      'LiveRamp UK & FR', 'Funnels & Journeys', 'S2S Handover',
      'X-Label Live-Ops Feed', 'Video Amp'
    ],
    icon: Shield,
    gradient: 'from-red-600 to-red-800'
  },
  {
    id: 'fy21-q4',
    period: 'FY21 Q4 (Q1 2021)',
    title: 'Continued CDP Maturity',
    description: 'Journey orchestration and continued platform maturation.',
    category: 'maturity',
    dataPoints: ['Codemasters'],
    capabilities: ['N21 Journeys', 'Social Club Journey'],
    icon: TrendingUp,
    gradient: 'from-indigo-600 to-indigo-800'
  },
  {
    id: 'fy22-q1',
    period: 'FY22 Q1 (Q2 2021)',
    title: 'Focus on Journeys & New Titles',
    description: 'Enhanced journey capabilities and integration with new game titles.',
    category: 'advanced',
    dataPoints: [
      'WWE 2K22', 'Tiny Tina\'s Launch', 'NBA 2K22', 'OlliOlli Launch', 'GTAV NG Launch'
    ],
    capabilities: ['A/B testing', 'Drip Campaigns', 'Social Club Journey POC'],
    icon: Users,
    gradient: 'from-teal-600 to-teal-800'
  },
  {
    id: 'fy22-q2',
    period: 'FY22 Q2 (Q3 2021)',
    title: 'Advanced Orchestration & Data Arch.',
    description: 'Advanced orchestration capabilities and new data architecture implementations.',
    category: 'advanced',
    capabilities: [
      'T2A Data Interface Upgrades', 'Event Driven Interactions POC',
      'GTAO New Player Onboarding', 'CIV 6 & XCOM data integration'
    ],
    icon: Database,
    gradient: 'from-pink-600 to-pink-800'
  },
  {
    id: 'fy22-q3',
    period: 'FY22 Q3 (Q4 2021)',
    title: 'ML Models & LiveOps Integration',
    description: 'Machine learning integration and comprehensive LiveOps capabilities.',
    category: 'advanced',
    capabilities: [
      'OFC new KPIs', 'RCS Model: D90 spend models', 'Snowflake Data Migration',
      'LiveOps Inbound/Outbound', 'Event Driven Data Processing'
    ],
    icon: Zap,
    gradient: 'from-yellow-600 to-yellow-800'
  },
  {
    id: 'fy22-q4',
    period: 'FY22 Q4 (Q1 2022)',
    title: 'Reporting & Compliance Refinement',
    description: 'Enhanced reporting capabilities and privacy automation.',
    category: 'advanced',
    capabilities: [
      'Reporting – S2S Automation', 'Email Attribution Reporting',
      'Privacy Automation', 'Customer Journey Refinement'
    ],
    dataPoints: ['Xsolla Coupon Data'],
    icon: Shield,
    gradient: 'from-emerald-600 to-emerald-800'
  },
  {
    id: '2024',
    period: '2024',
    title: 'Current State - Advanced CDP Capabilities',
    description: 'Comprehensive CDP with massive scale, advanced ML capabilities, and multi-label orchestration.',
    category: 'future',
    metrics: [
      '813M Player accounts',
      '79.8M Gen 9 (PS5 + XbX/S + Switch 2)',
      '550M Gen 8 & PC (PS4 + XB1 + Switch + PC)',
      '67 Titles',
      '329.4M Emails for marketing',
      '183.9M Active subscribers (61.3M 2K + 122.6M R*)'
    ],
    capabilities: [
      'Segmentation', 'Experimentation', 'NRT Journeys', 'Activation',
      'ML Scores', 'Batch Journeys', 'Managed Stream', 'X-Label Data', 'Web API'
    ],
    icon: Target,
    gradient: 'from-violet-600 via-purple-600 to-indigo-600'
  }
];

export const CDPTimeline: React.FC = () => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <div className="py-16 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            CDP Evolution Timeline
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The journey from foundational data collection to a comprehensive, 
            multi-label Customer Data Platform powering the future of gaming.
          </p>
        </motion.div>


        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-gray-600 via-blue-500 to-violet-600 h-full rounded-full" />
          
          <div className="space-y-8">
            {timelineData.map((event, index) => {
              const isExpanded = expandedEvent === event.id;
              const isEven = index % 2 === 0;
              
              return (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  index={index}
                  isExpanded={isExpanded}
                  isEven={isEven}
                  onToggle={() => setExpandedEvent(isExpanded ? null : event.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">813M</div>
            <div className="text-blue-100">Player Accounts</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface TimelineEventProps {
  event: TimelineEvent;
  index: number;
  isExpanded: boolean;
  isEven: boolean;
  onToggle: () => void;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  index,
  isExpanded,
  isEven,
  onToggle
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const IconComponent = event.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Content */}
      <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          onClick={onToggle}
        >
          {/* Period Badge */}
          <div className={`inline-block bg-gradient-to-r ${event.gradient} text-white px-4 py-2 rounded-full text-sm font-medium mb-4`}>
            {event.period}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
            {event.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-300 mb-4 leading-relaxed">
            {event.description}
          </p>

          {/* Expand/Collapse Indicator */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 group-hover:text-white transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              {/* Data Points */}
              {event.dataPoints && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Feeds
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.dataPoints.map((point, idx) => (
                      <span key={idx} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels */}
              {event.channels && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Channels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.channels.map((channel, idx) => (
                      <span key={idx} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              {event.capabilities && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.capabilities.map((capability, idx) => (
                      <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {event.metrics && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Metrics
                  </h4>
                  <div className="space-y-2">
                    {event.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm">
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline Node */}
      <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
        <motion.div
          className={`w-12 h-12 rounded-full bg-gradient-to-r ${event.gradient} flex items-center justify-center shadow-lg`}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.3 }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </motion.div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Empty space for alignment */}
      <div className="w-1/2" />
    </motion.div>
  );
};
