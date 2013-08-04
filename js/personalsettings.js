var LdapConfiguration = {
	refreshConfig: function() {
		if($('#ldap_addressbook_chooser option').length < 2) {
			LdapConfiguration.addConfiguration(true);
			return;
		}
		$.post(
			OC.filePath('contacts','ajax','personalsettings.php?function=list'),
			$('#ldap_addressbook_chooser').serialize(),
			function (result) {
				if(result.status == 'success') {
					$.each(result.ldapArray, function(configkey, configvalue) {
						elementID = '#'+configkey;
						

						//deal with Checkboxes
						if($(elementID).is('input[type=checkbox]')) {
							if(configvalue == 1) {
								$(elementID).attr('checked', 'checked');
							} else {
								$(elementID).removeAttr('checked');
							}
							return;
						}

						//On Textareas, Multi-Line Settings come as array
						if($(elementID).is('textarea') && $.isArray(configvalue)) {
							configvalue = configvalue.join("\n");
						}

						// assign the value
						$('#'+configkey).val(configvalue);
					});
				}
			}
		);
	},

	resetDefaults: function() {
		$('#ldap').find('input[type=text], input[type=number], input[type=password], textarea, select').each(function() {
			if($(this).attr('id') == 'ldap_serverconfig_chooser') {
				return;
			}
			$(this).val($(this).attr('data-default'));
		});
		$('#ldap').find('input[type=checkbox]').each(function() {
			if($(this).attr('data-default') == 1) {
				$(this).attr('checked', 'checked');
			} else {
				$(this).removeAttr('checked');
			}
		});
	},

	deleteConfiguration: function() {
		$.post(
			OC.filePath('contacts','ajax','deleteConfiguration.php'),
			$('#ldap_serverconfig_chooser').serialize(),
			function (result) {
				if(result.status == 'success') {
					$('#ldap_serverconfig_chooser option:selected').remove();
					$('#ldap_serverconfig_chooser option:first').select();
					LdapConfiguration.refreshConfig();
				} else {
					OC.dialogs.alert(
						result.message,
						t('contacts', 'Deletion failed')
					);
				}
			}
		);
	},

	addConfiguration: function(doNotAsk) {
		$.post(
			OC.filePath('contacts','ajax','getNewServerConfigPrefix.php'),
			function (result) {
				if(result.status == 'success') {
					if(doNotAsk) {
						LdapConfiguration.resetDefaults();
					} else {
						OC.dialogs.confirm(
							t('contacts', 'Take over settings from recent server configuration?'),
							t('contacts', 'Keep settings?'),
							function(keep) {
								if(!keep) {
									LdapConfiguration.resetDefaults();
								}
							}
						);
					}
					$('#ldap_serverconfig_chooser option:selected').removeAttr('selected');
					var html = '<option value="'+result.configPrefix+'" selected="selected">'+$('#ldap_serverconfig_chooser option').length+'. Server</option>';
					$('#ldap_serverconfig_chooser option:last').before(html);
				} else {
					OC.dialogs.alert(
						result.message,
						t('contacts', 'Cannot add server configuration')
					);
				}
			}
		);
	}
}

$(document).ready(function() {
	$('#ldapAdvancedAccordion').accordion({ heightStyle: 'content', animate: 'easeInOutCirc'});
	$('#ldap_submit').button();
	$('#ldap_action_test_connection').button();
	$('#ldap_action_delete_configuration').button();
	LdapConfiguration.refreshConfig();
	$('#ldap_action_test_connection').click(function(event){
		event.preventDefault();
		$.post(
			OC.filePath('contacts','ajax','personalsettings.php?function=test'),
			$('#ldap').serialize(),
			function (result) {
				if (result.status == 'success') {
					OC.dialogs.alert(
						result.message,
						t('contacts', 'Connection test succeeded')
					);
				} else {
					OC.dialogs.alert(
						result.message,
						t('contacts', 'Connection test failed')
					);
				}
			}
		);
	});

	$('#ldap_action_delete_configuration').click(function(event) {
		event.preventDefault();
		OC.dialogs.confirm(
			t('contacts', 'Do you really want to delete the current Server Configuration?'),
			t('contacts', 'Confirm Deletion'),
			function(deleteConfiguration) {
				if(deleteConfiguration) {
					LdapConfiguration.deleteConfiguration();
				}
			}
		);
	});

	$('#ldap_submit').click(function(event) {
		event.preventDefault();
		$.post(
			OC.filePath('contacts','ajax','setConfiguration.php'),
			$('#ldap').serialize(),
			function (result) {
				bgcolor = $('#ldap_submit').css('background');
				if (result.status == 'success') {
					//the dealing with colors is a but ugly, but the jQuery version in use has issues with rgba colors
					$('#ldap_submit').css('background', '#fff');
					$('#ldap_submit').effect('highlight', {'color':'#A8FA87'}, 5000, function() {
						$('#ldap_submit').css('background', bgcolor);
					});
				} else {
					$('#ldap_submit').css('background', '#fff');
					$('#ldap_submit').effect('highlight', {'color':'#E97'}, 5000, function() {
						$('#ldap_submit').css('background', bgcolor);
					});
				}
			}
		);
	});

	$('#ldap_addressbook_chooser').change(function(event) {
		value = $('#ldap_addressbook_chooser option:selected:first').attr('value');
		if(value == 'NEW') {
			LdapConfiguration.addConfiguration(false);
		} else {
			LdapConfiguration.refreshConfig();
		}
	});
});
