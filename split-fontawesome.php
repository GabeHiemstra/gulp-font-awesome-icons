<?php
$files = array( 'fas' => 'fa-solid.js', 'far' => 'fa-regular.js', 'fal' => 'fa-light.js', 'fab' => 'fa-brands.js' );

foreach( $files as $weight => $file )
{
	print( __DIR__ . '/js/' . $file . "\n" );

	if( is_file( __DIR__ . '/js/' . $file ) )
	{
		$_contents = file_get_contents( __DIR__ . '/js/' . $file );

		// First check if triple parts are present (the three sub-groups represent header/icons/footer)
		if( preg_match( '/^(.*?var icons = \{\s*)(.*?)(\};.*)$/si' , $_contents ) )
		{
			// create type dir
			if( !is_dir( __DIR__ . '/js/_partials-' .$weight ) ) mkdir( __DIR__ . '/js/_partials-' .$weight );

			// 1) Header
			$_content_header = preg_replace( '/^(.*?var icons = \{\s*)(.*?)(\};.*)$/si', '$1', $_contents );
			file_put_contents( __DIR__ . '/js/_partials-' .$weight . '/_header.js', $_content_header );

			// 2) Individual icons
			$_content_icons = preg_replace( '/^(.*?var icons = \{\s*)(.*?)(\};.*)$/si', '$2', $_contents );

			// 3) Footer
			$_content_footer = preg_replace( '/^(.*?var icons = \{\s*)(.*?)(\};.*)$/si', '$3', $_contents );
			file_put_contents( __DIR__ . '/js/_partials-' .$weight . '/_footer.js', $_content_footer );

			// Now process each individual line with icons, split them, and save them as separate files.
			preg_match_all( '/^(.*)\s*$/im', $_content_icons, $_icons, PREG_SET_ORDER );

			//\loop_file, 
			//\append , to end if not three
			//\save line as file
			for( $i = 0; $i < count( $_icons ); $i++ )
			{
				$_icon = $_icons[$i][1];

				if( !preg_match( '/,$/si', $_icon ) )
				{
					$_icon = $_icon . ',';
				}

				$_icon_name = preg_replace( '/^.*?\"([^\"]+).*$/si', '$1', $_icon );
				$_icon_name = preg_replace_callback( '/\-([a-z])/si', function($m){return strtoupper($m[1]);}, $_icon_name );
				$_icon_name = 'fa' . ucfirst($_icon_name);

				// print( $_icon_name . ' --- ' . $_icon . "\n" );
				file_put_contents( __DIR__ . '/js/_partials-' .$weight . '/' . $_icon_name.'.js', $_icon );
			}

			//die();
		}
	}
}