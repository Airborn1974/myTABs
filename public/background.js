
// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-current-tab") {
    saveCurrentTab();
  }
});

// Listen for extension icon click
chrome.action.onClicked.addListener(() => {
  saveCurrentTab();
});

// Function to save the current tab
function saveCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const currentTab = tabs[0];
      
      // Save tab to storage
      chrome.storage.local.get('workspaceData', (result) => {
        const workspaceData = result.workspaceData || { tabs: [], notes: [], todoLists: [], groups: [] };
        
        // Check if tab already exists
        const tabExists = workspaceData.tabs.some(tab => tab.url === currentTab.url);
        
        if (!tabExists) {
          // Get default group or create one
          let defaultGroup = workspaceData.groups[0];
          if (!defaultGroup) {
            defaultGroup = {
              id: "group-default",
              title: "Default",
              color: "#4f46e5"
            };
            workspaceData.groups.push(defaultGroup);
          }
          
          // Add the tab to workspace
          const newTab = {
            id: `tab-${Date.now()}`,
            title: currentTab.title || "Untitled Tab",
            url: currentTab.url || "",
            favicon: currentTab.favIconUrl,
            groupId: defaultGroup.id,
            bookmarked: false
          };
          
          workspaceData.tabs.push(newTab);
          
          // Save updated workspace data
          chrome.storage.local.set({ workspaceData });
          
          // Show a notification
          chrome.action.setBadgeText({ text: "✓" });
          setTimeout(() => {
            chrome.action.setBadgeText({ text: "" });
          }, 1500);
        }
      });
    }
  });
}
