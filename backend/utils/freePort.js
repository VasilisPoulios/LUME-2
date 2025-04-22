const { exec } = require('child_process');
const readline = require('readline');

const PORT = process.env.PORT || 50001;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to find processes using port 5000
const findProcess = () => {
  const command = process.platform === 'win32'
    ? `netstat -ano | findstr :${PORT}`
    : `lsof -i :${PORT}`;

  console.log(`Looking for processes using port ${PORT}...`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error finding processes: ${error.message}`);
      rl.close();
      return;
    }
    
    if (stderr) {
      console.error(`Error: ${stderr}`);
      rl.close();
      return;
    }
    
    if (!stdout) {
      console.log(`No process found using port ${PORT}`);
      rl.close();
      return;
    }
    
    console.log('Processes using port 5000:');
    console.log(stdout);
    
    if (process.platform === 'win32') {
      // Parse PID from Windows netstat output
      // Example output line: TCP    0.0.0.0:5000      0.0.0.0:0       LISTENING    1234
      const lines = stdout.split('\n').filter(line => line.trim());
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          pids.add(parts[parts.length - 1]);
        }
      });
      
      if (pids.size > 0) {
        askToKillProcesses(Array.from(pids));
      } else {
        console.log('Could not determine the PID of the process');
        rl.close();
      }
    } else {
      // Parse PID from Unix lsof output
      // Example output line: node    1234 username   17u  IPv4 12345678      0t0  TCP *:5000 (LISTEN)
      const lines = stdout.split('\n').filter(line => line.trim());
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 2) {
          pids.add(parts[1]);
        }
      });
      
      if (pids.size > 0) {
        askToKillProcesses(Array.from(pids));
      } else {
        console.log('Could not determine the PID of the process');
        rl.close();
      }
    }
  });
};

// Function to ask user if they want to kill the processes
const askToKillProcesses = (pids) => {
  rl.question(`Do you want to kill the process(es) using port ${PORT}? (yes/no): `, (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      killProcesses(pids);
    } else {
      console.log('No processes were killed.');
      rl.close();
    }
  });
};

// Function to kill processes
const killProcesses = (pids) => {
  pids.forEach(pid => {
    const command = process.platform === 'win32'
      ? `taskkill /F /PID ${pid}`
      : `kill -9 ${pid}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error killing process ${pid}: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }
      
      console.log(`Successfully killed process with PID ${pid}`);
    });
  });
  
  console.log('Port should now be free to use.');
  rl.close();
};

// Start the process
findProcess(); 