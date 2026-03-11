import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Advanced incident response scenarios with AI-powered analysis
const INCIDENT_SCENARIOS = [
  {
    id: 'phishing',
    title: 'Phishing Attack',
    description: 'Responding to a suspected phishing email or website',
    priority: 'high',
    category: 'social-engineering',
    indicators: ['suspicious-url', 'urgent-language', 'sender-spoofing', 'attachment-malware'],
    aiAnalysis: {
      riskFactors: ['URL manipulation', 'Social engineering', 'Credential harvesting'],
      recommendedActions: ['Isolate communication', 'Verify sender', 'Check URL reputation']
    },
    steps: [
      'Do not click any links or download attachments',
      'Report the incident to your IT security team',
      'Verify the sender through alternative means',
      'Check URL reputation using security tools',
      'Change passwords for affected accounts',
      'Enable two-factor authentication',
      'Monitor accounts for suspicious activity',
      'Scan your device for malware',
      'Document the incident for future reference'
    ],
    escalationTriggers: ['multiple-users-affected', 'financial-data-at-risk', 'executive-targeting']
  },
  {
    id: 'malware',
    title: 'Malware Infection',
    description: 'Detected malware on your system',
    priority: 'critical',
    category: 'infection',
    indicators: ['unusual-behavior', 'high-cpu-usage', 'network-anomalies', 'file-modifications'],
    aiAnalysis: {
      riskFactors: ['System compromise', 'Data exfiltration', 'Lateral movement'],
      recommendedActions: ['Network isolation', 'Memory analysis', 'Behavioral monitoring']
    },
    steps: [
      'Disconnect from the network immediately',
      'Run a full antivirus scan with updated signatures',
      'Quarantine infected files and systems',
      'Take memory dumps for analysis',
      'Change all passwords and revoke sessions',
      'Update all software and security patches',
      'Monitor system for unusual behavior',
      'Consider professional incident response help',
      'Preserve evidence for forensic analysis'
    ],
    escalationTriggers: ['data-encryption', 'persistence-mechanisms', 'command-control-communication']
  },
  {
    id: 'data-breach',
    title: 'Data Breach',
    description: 'Suspected unauthorized access to sensitive data',
    priority: 'critical',
    category: 'breach',
    indicators: ['unauthorized-access', 'data-exfiltration', 'anomaly-detection', 'audit-log-anomalies'],
    aiAnalysis: {
      riskFactors: ['Data exposure', 'Regulatory compliance', 'Reputational damage'],
      recommendedActions: ['Access revocation', 'Data classification assessment', 'Legal consultation']
    },
    steps: [
      'Contain the breach by securing affected systems',
      'Assess the scope and impact of the breach',
      'Identify compromised data types and volumes',
      'Notify affected individuals and authorities as required',
      'Preserve evidence for investigation and legal purposes',
      'Review and update security measures',
      'Implement additional monitoring and logging',
      'Communicate transparently with stakeholders',
      'Conduct post-incident review and lessons learned'
    ],
    escalationTriggers: ['pii-exposure', 'financial-data-breach', 'nation-state-actor']
  },
  {
    id: 'ransomware',
    title: 'Ransomware Attack',
    description: 'Files encrypted by ransomware',
    priority: 'critical',
    category: 'ransomware',
    indicators: ['file-encryption', 'ransom-note', 'bitcoin-wallet', 'encryption-extensions'],
    aiAnalysis: {
      riskFactors: ['Data loss', 'Operational disruption', 'Financial extortion'],
      recommendedActions: ['Backup verification', 'Decryption tools', 'Law enforcement coordination']
    },
    steps: [
      'Isolate affected systems from the network immediately',
      'Do not pay the ransom under any circumstances',
      'Report to law enforcement (FBI IC3, local authorities)',
      'Identify the ransomware variant using tools like ID Ransomware',
      'Check for available decryption tools on No More Ransom',
      'Restore from clean, offline backups',
      'Scan for and remove malware using multiple tools',
      'Update security measures and patch vulnerabilities',
      'Review backup and recovery procedures',
      'Implement network segmentation for future protection'
    ],
    escalationTriggers: ['critical-systems-affected', 'large-scale-encryption', 'ransom-payment-pressure']
  },
  {
    id: 'credential-theft',
    title: 'Credential Theft',
    description: 'Stolen usernames and passwords',
    priority: 'high',
    category: 'credential-compromise',
    indicators: ['brute-force-attempts', 'password-spraying', 'credential-stuffing', 'unusual-login-locations'],
    aiAnalysis: {
      riskFactors: ['Account takeover', 'Lateral movement', 'Data access'],
      recommendedActions: ['Password reset', 'MFA enforcement', 'Account monitoring']
    },
    steps: [
      'Change all compromised passwords immediately',
      'Enable two-factor/multi-factor authentication everywhere',
      'Review account activity logs for suspicious access',
      'Notify service providers of potential compromise',
      'Monitor for unauthorized access attempts',
      'Use a password manager for secure credential storage',
      'Consider credit monitoring and identity protection services',
      'Implement password policies and regular rotation',
      'Train users on credential hygiene'
    ],
    escalationTriggers: ['privileged-account-compromise', 'multiple-accounts-affected', 'sensitive-data-access']
  },
  {
    id: 'ddos-attack',
    title: 'DDoS Attack',
    description: 'Distributed Denial of Service attack',
    priority: 'high',
    category: 'availability',
    indicators: ['traffic-spikes', 'service-unavailability', 'slow-performance', 'botnet-signatures'],
    aiAnalysis: {
      riskFactors: ['Service disruption', 'Resource exhaustion', 'Financial loss'],
      recommendedActions: ['Traffic filtering', 'Rate limiting', 'CDN protection']
    },
    steps: [
      'Activate DDoS mitigation services if available',
      'Implement rate limiting and traffic filtering',
      'Scale resources to handle increased load',
      'Monitor attack patterns and sources',
      'Communicate with ISP for upstream filtering',
      'Document attack details for post-incident analysis',
      'Review and update DDoS protection measures',
      'Consider engaging DDoS mitigation specialists'
    ],
    escalationTriggers: ['extended-downtime', 'financial-impact', 'critical-service-disruption']
  },
  {
    id: 'insider-threat',
    title: 'Insider Threat',
    description: 'Potential security threat from within the organization',
    priority: 'high',
    category: 'insider',
    indicators: ['unusual-access-patterns', 'data-exfiltration', 'policy-violations', 'privilege-abuse'],
    aiAnalysis: {
      riskFactors: ['Authorized access abuse', 'Data theft', 'Sabotage'],
      recommendedActions: ['Access review', 'Behavioral monitoring', 'HR involvement']
    },
    steps: [
      'Monitor and log all suspicious activities',
      'Review access permissions and privileges',
      'Implement least privilege principles',
      'Conduct security awareness training',
      'Establish clear security policies and procedures',
      'Monitor for unusual data access patterns',
      'Consider involving HR and legal teams',
      'Preserve evidence for potential investigation'
    ],
    escalationTriggers: ['data-theft-confirmed', 'system-sabotage', 'policy-violations']
  }
];

// AI-powered incident analysis function
function analyzeIncident(description: string, indicators: string[]) {
  // Simple keyword-based analysis (in production, use ML models)
  const riskKeywords = {
    critical: ['ransomware', 'breach', 'encryption', 'data loss', 'critical system'],
    high: ['phishing', 'malware', 'credential', 'unauthorized', 'suspicious'],
    medium: ['unusual', 'anomaly', 'attempt', 'suspicious activity'],
    low: ['monitoring', 'log', 'review']
  };

  let riskLevel = 'low';
  const foundIndicators = [];

  for (const [level, keywords] of Object.entries(riskKeywords)) {
    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword)) {
        riskLevel = level;
        break;
      }
    }
    if (riskLevel !== 'low') break;
  }

  // Analyze indicators
  for (const indicator of indicators) {
    if (INCIDENT_SCENARIOS.some(scenario =>
      scenario.indicators.includes(indicator)
    )) {
      foundIndicators.push(indicator);
    }
  }

  return {
    riskLevel,
    confidence: foundIndicators.length / indicators.length,
    matchedIndicators: foundIndicators,
    recommendedPriority: riskLevel === 'critical' ? 'immediate' : riskLevel === 'high' ? 'urgent' : 'normal'
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(INCIDENT_SCENARIOS);
  } catch (error) {
    console.error('Error fetching incident scenarios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { incidentType, description, indicators = [] } = body;

    if (!incidentType) {
      return NextResponse.json({ error: 'Incident type is required' }, { status: 400 });
    }

    // Find the scenario
    const scenario = INCIDENT_SCENARIOS.find(s => s.id === incidentType);
    if (!scenario) {
      return NextResponse.json({ error: 'Invalid incident type' }, { status: 400 });
    }

    // Perform AI analysis
    const aiAnalysis = analyzeIncident(description || '', indicators);

    // Log incident in database (commented out since incident model may not exist)
    // const incident = await db.incident.create({
    //   data: {
    //     userId: session.user.id,
    //     type: incidentType,
    //     title: scenario.title,
    //     description: description || scenario.description,
    //     priority: scenario.priority,
    //     status: 'active',
    //     indicators: indicators,
    //     aiAnalysis: aiAnalysis
    //   }
    // });

    // Generate comprehensive response
    const response = {
      incidentId: `temp-${Date.now()}`, // Temporary ID since DB logging is commented out
      incidentType,
      title: scenario.title,
      priority: scenario.priority,
      category: scenario.category,
      steps: scenario.steps,
      immediateActions: scenario.steps.slice(0, 3),
      description: description || scenario.description,
      indicators: scenario.indicators,
      aiAnalysis: {
        ...scenario.aiAnalysis,
        analysis: aiAnalysis,
        riskAssessment: aiAnalysis.riskLevel,
        confidence: aiAnalysis.confidence
      },
      escalationTriggers: scenario.escalationTriggers,
      timestamp: new Date().toISOString(),
      emergencyContacts: getEmergencyContacts(incidentType),
      recommendedPriority: aiAnalysis.recommendedPriority
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing incident response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// New endpoint for incident analysis
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, indicators = [] } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required for analysis' }, { status: 400 });
    }

    // AI-powered incident classification
    const analysis = analyzeIncident(description, indicators);

    // Find best matching scenario
    let bestMatch = null;
    let bestScore = 0;

    for (const scenario of INCIDENT_SCENARIOS) {
      let score = 0;

      // Check description keywords
      const descWords = description.toLowerCase().split(' ');
      for (const word of descWords) {
        if (scenario.description.toLowerCase().includes(word)) score += 1;
        if (scenario.title.toLowerCase().includes(word)) score += 2;
      }

      // Check indicators
      for (const indicator of indicators) {
        if (scenario.indicators.includes(indicator)) score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = scenario;
      }
    }

    const response = {
      analysis,
      suggestedIncidentType: bestMatch?.id || 'unknown',
      suggestedScenario: bestMatch,
      confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0,
      recommendations: analysis.recommendedPriority === 'immediate' ?
        ['Escalate immediately', 'Notify security team', 'Isolate affected systems'] :
        analysis.recommendedPriority === 'urgent' ?
        ['Respond within 1 hour', 'Assess impact', 'Document incident'] :
        ['Monitor situation', 'Gather more information', 'Plan response']
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getEmergencyContacts(incidentType: string) {
  const baseContacts = [
    { name: 'Local Law Enforcement', number: '911', description: 'For immediate threats' },
    { name: 'FBI Internet Crime', url: 'ic3.gov', description: 'Report cybercrimes' },
    { name: 'CISA', url: 'cisa.gov', description: 'Cybersecurity guidance' }
  ];

  switch (incidentType) {
    case 'phishing':
    case 'credential-theft':
      return [
        ...baseContacts,
        { name: 'FTC Identity Theft', url: 'identitytheft.gov', description: 'Identity theft resources' }
      ];
    case 'malware':
    case 'ransomware':
      return [
        ...baseContacts,
        { name: 'Microsoft Security', url: 'microsoft.com/security', description: 'Malware removal tools' },
        { name: 'Malwarebytes', url: 'malwarebytes.com', description: 'Antimalware tools' }
      ];
    case 'data-breach':
      return [
        ...baseContacts,
        { name: 'Privacy Rights Clearinghouse', url: 'privacyrights.org', description: 'Data breach resources' }
      ];
    default:
      return baseContacts;
  }
}
