<?php
  /*
  Plugin Name: Astro Static Server
  Description: Serves static HTML files from the /portal/ directory without redirection for clean URLs.
  Version: 2.2
  Author: Gemini Assistant & Aziz Bey
  */


  // This plugin will not work if ABSPATH is not defined.
  if (!defined('ABSPATH')) {
      return;
  }


  // Get the requested URI from the server.
  $request_uri = $_SERVER['REQUEST_URI'];


  // --- Security Check ---
  // Prevent directory traversal attacks. Disallow any '..' in the path.
  if (strpos($request_uri, '..') !== false) {
      // Let WordPress handle it as a bad request.
      return;
  }


  // --- Path Mapping ---
  // 1. Sanitize the URI to prevent potential issues.
  $sanitized_uri = strtok($request_uri, '?');


  // 2. Determine the potential target path in the /portal/ directory.
  // Use ABSPATH, the absolute path to the WordPress directory.
  $base_path = ABSPATH . 'portal';
  $target_path = $base_path . $sanitized_uri;


  // 3. Handle requests for directories with a trailing slash (e.g., /blog/ or /)
  if (substr($target_path, -1) === '/') {
      $final_file_path = $target_path . 'index.html';
  }
  // 4. Handle requests for clean URLs without a trailing slash (e.g., /hakkimizda or /blog)
  else if (!pathinfo($target_path, PATHINFO_EXTENSION)) {
      // First, check if it's a directory (e.g., /blog)
      if (is_dir($target_path)) {
          // It is a directory. Redirect to the version with a slash for consistency.
          header("Location: " . $sanitized_uri . "/");
          exit;
      }
      // It's not a directory, so assume it's a file and add .html
      $final_file_path = $target_path . '.html';
  }
  // 5. Handle requests for files that already have an extension (e.g., /favicon.svg)
  else {
      $final_file_path = $target_path;
  }


  // --- File Serving ---
  // Check if the calculated file path actually exists and is a file.
  if (isset($final_file_path) && file_exists($final_file_path) && is_file($final_file_path)) {

      // It exists! Let's serve it.

      // Determine content type based on file extension for assets like CSS, JS, images
      $extension = strtolower(pathinfo($final_file_path, PATHINFO_EXTENSION));
      switch ($extension) {
          case 'css':
              $content_type = 'text/css';
              break;
          case 'js':
              $content_type = 'application/javascript';
              break;
          case 'svg':
              $content_type = 'image/svg+xml';
              break;
          case 'png':
              $content_type = 'image/png';
              break;
          case 'jpg':
          case 'jpeg':
              $content_type = 'image/jpeg';
              break;
          case 'ico':
              $content_type = 'image/x-icon';
              break;
          default:
              $content_type = 'text/html; charset=utf-8';
      }

      header('Content-Type: ' . $content_type);
      readfile($final_file_path);
      exit;
  }


  // --- Fallback ---
  // If no file was found, let WordPress handle the request.
  ?>