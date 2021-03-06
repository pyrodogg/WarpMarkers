/*
MapMarkers Minecraft Bukkit plugin for showing Essentials warps 
and warp events on maps generated by Minecraft Overviewer.
Copyright (C) 2011 Brendan Johan Lee 
Email: brendan (at) vanntett.net

Part of this code is from the Essentials bukkit plug-in
Copyright (C) 2011 Essentials Team

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, 
MA  02110-1301, USA.
*/

package is.brendan.WarpMarkers;

import java.util.logging.*;

import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.block.Sign;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerListener;

import com.earth2me.essentials.IEssentials;
import com.earth2me.essentials.User;
import com.earth2me.essentials.signs.*;
import com.earth2me.essentials.signs.EssentialsSign.*;

/**
 * Handle events when a user interacts with a sign
 * @author Brendan Johan Lee - deadcyclo@vanntett.net
 */

public class WarpMarkersSignPlayerListener extends PlayerListener {
    private final WarpMarkers plugin;

    public WarpMarkersSignPlayerListener(WarpMarkers instance) {
        plugin = instance;
    }
	
    public void onPlayerInteract(PlayerInteractEvent event) {
	/* This checks almost everything in a very messy way. There is no way of checking that the user has enough
	   currency if the sign isn't free */
	if (!plugin.isEssentialsRunning()) return;
	if (plugin.essentialPlugin.getSettings().areSignsDisabled()) return;
	final Block block = event.getClickedBlock();
	if (block == null) return;
	if (block.getTypeId() == Material.SIGN_POST.getId() || block.getTypeId() == Material.WALL_SIGN.getId()) {
	    if (event.getAction() != Action.RIGHT_CLICK_BLOCK) return;
	    final Sign csign = (Sign)block.getState();
	    for (Signs signs : Signs.values()) {
		final EssentialsSign sign = signs.getSign();
		if (csign.getLine(0).equalsIgnoreCase(sign.getSuccessName())) {
		    final ISign isign = new BlockSign(block);
		    final User user = plugin.essentialPlugin.getUser(event.getPlayer());
		    final String signName = sign.getTemplateName().substring(1,sign.getTemplateName().length()-1).toLowerCase();
		    boolean success = (user.isAuthorized("essentials.signs." + signName + ".use")
				       || user.isAuthorized("essentials.signs.use." + signName));
		    final String warpName = isign.getLine(1);
		    final String group = isign.getLine(2);
		    boolean secondsuccess = ((!group.isEmpty()
			 && ("§2Everyone".equals(group)
			     || user.inGroup(group)))
					     || (group.isEmpty() && (!plugin.essentialPlugin.getSettings().getPerWarpPermission() || user.isAuthorized("essentials.warp." + warpName))));
		    if (success && secondsuccess) {
			plugin.handleSignWarp(user.getName(), isign.getLine(1));
		    }
		}
	    }
	}
    }

    private boolean signInteract(ISign sign, User player, String username) {
	final String warpName = sign.getLine(1);
	final String group = sign.getLine(2);
	if ((!group.isEmpty()
	     && ("§2Everyone".equals(group)
		 || player.inGroup(group)))
	    || (group.isEmpty() && (!plugin.essentialPlugin.getSettings().getPerWarpPermission() || player.isAuthorized("essentials.warp." + warpName)))) {
	    return true;
	}
	return false;
    }
}



