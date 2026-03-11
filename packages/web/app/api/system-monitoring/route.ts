import { NextResponse } from 'next/server';
import si from 'systeminformation';

interface NetworkStatsEntry {
  rx_bytes: number;
  tx_bytes: number;
}

// Global store for persistent data across requests
declare global {
  var networkStatsStore: {
    previousNetworkStats: NetworkStatsEntry[];
    lastUpdateTime: number;
  } | undefined;
}

// Initialize global store if not exists
if (!global.networkStatsStore) {
  global.networkStatsStore = {
    previousNetworkStats: [],
    lastUpdateTime: Date.now()
  };
}

export async function GET() {
  try {
    // Get network statistics
    const networkStats = await si.networkStats();
    // const networkInterfaces = await si.networkInterfaces();

    // Get process information for threat-like monitoring
    const processes = await si.processes();
    // const services = await si.services('*');

    // Get system load and CPU info
    const currentLoad = await si.currentLoad();
    // const cpu = await si.cpu();

    // Calculate network traffic rate (bytes per second)
    const currentTime = Date.now();
    const timeDiff = (currentTime - (global.networkStatsStore?.lastUpdateTime || currentTime)) / 1000; // seconds

    let trafficRate = 0;
    if (global.networkStatsStore?.previousNetworkStats.length && timeDiff > 0) {
      const currentTotal = networkStats.reduce((acc, iface) => acc + iface.rx_bytes + iface.tx_bytes, 0);
      const previousTotal = global.networkStatsStore.previousNetworkStats.reduce((acc, iface) => acc + iface.rx_bytes + iface.tx_bytes, 0);
      const bytesDiff = currentTotal - previousTotal;
      trafficRate = Math.max(0, bytesDiff / timeDiff); // bytes per second
    }

    // Update stored values for next calculation
    if (global.networkStatsStore) {
      global.networkStatsStore.previousNetworkStats = networkStats.map(iface => ({ rx_bytes: iface.rx_bytes, tx_bytes: iface.tx_bytes }));
      global.networkStatsStore.lastUpdateTime = currentTime;
    }

    // Calculate active connections (simplified - using process count as proxy)
    const activeConnections = processes.list.length;

    // Calculate potential threats (processes with high CPU usage or suspicious names)
    const highCpuProcesses = processes.list.filter(p => p.cpu > 50).length;
    const suspiciousProcesses = processes.list.filter(p =>
      p.name.toLowerCase().includes('miner') ||
      p.name.toLowerCase().includes('trojan') ||
      p.name.toLowerCase().includes('virus') ||
      p.name.toLowerCase().includes('malware')
    ).length;

    const threats = highCpuProcesses + suspiciousProcesses;

    // Calculate packets (rough estimate based on network activity)
    const packets = Math.floor((networkStats.reduce((acc, iface) => acc + iface.rx_bytes + iface.tx_bytes, 0)) / 1000); // Simplified calculation

    // Format traffic in human readable format (KB, MB, GB)
    const formatTraffic = (bytesPerSecond: number): string => {
      if (bytesPerSecond === 0) return '0 B/s';
      const k = 1024;
      const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
      const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
      return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const monitoringData = {
      threatMonitoring: {
        status: 'Active',
        threats: Math.max(0, threats),
        lastUpdate: new Date().toISOString()
      },
      firewallStatus: {
        status: 'Active',
        connections: activeConnections,
        lastUpdate: new Date().toISOString()
      },
      networkTraffic: {
        status: 'Normal',
        packets: Math.max(100, packets), // Minimum 100 packets
        traffic: formatTraffic(trafficRate),
        lastUpdate: new Date().toISOString()
      },
      systemLoad: {
        cpu: Math.round(currentLoad.currentLoad),
        memory: null, // Memory calculation removed due to API change
        processes: processes.list.length
      }
    };

    return NextResponse.json(monitoringData);
  } catch (error) {
    console.error('System monitoring error:', error);
    // Fallback to simulated data if system monitoring fails
    const simulatedTrafficRate = Math.random() * 1024 * 1024; // Random traffic up to 1 MB/s
    const formatTraffic = (bytesPerSecond: number): string => {
      if (bytesPerSecond === 0) return '0 B/s';
      const k = 1024;
      const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
      const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
      return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return NextResponse.json({
      threatMonitoring: {
        status: 'Active',
        threats: Math.floor(Math.random() * 5),
        lastUpdate: new Date().toISOString()
      },
      firewallStatus: {
        status: 'Active',
        connections: Math.floor(Math.random() * 100) + 50,
        lastUpdate: new Date().toISOString()
      },
      networkTraffic: {
        status: 'Normal',
        packets: Math.floor(Math.random() * 1000) + 500,
        traffic: formatTraffic(simulatedTrafficRate),
        lastUpdate: new Date().toISOString()
      },
      systemLoad: {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 16) + 4,
        processes: Math.floor(Math.random() * 200) + 50
      },
      error: 'Using simulated data due to system monitoring failure'
    });
  }
}
