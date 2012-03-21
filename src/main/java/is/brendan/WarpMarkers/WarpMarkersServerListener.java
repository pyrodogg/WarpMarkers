package is.brendan.WarpMarkers;

import is.brendan.WarpMarkers.WarpMarkers;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.server.PluginDisableEvent;
import org.bukkit.event.server.PluginEnableEvent;


public class WarpMarkersServerListener implements Listener {
	
	private  WarpMarkers plugin;
	
	public WarpMarkersServerListener(WarpMarkers plugin){
		this.plugin = plugin;
	}
	
	@EventHandler
	public void onPluginDisable(PluginDisableEvent event){
		if (event.getPlugin().getDescription().getMain().contains("com.earth2me.essentials")) plugin.disableEssentialsListening();
	}
	
	@EventHandler
	public void onPluginEnable(PluginEnableEvent event){
		if (event.getPlugin().getDescription().getMain().contains("com.earth2me.essentials")) plugin.enableEssentialsListening();
	}

}
