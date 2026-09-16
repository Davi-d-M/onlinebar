package com.example.theapp

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import android.widget.RemoteViews
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.net.URL

class OnlineBarWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.example.theapp.ACTION_WIDGET_REFRESH") {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(ComponentName(context, OnlineBarWidgetProvider::class.java))
            for (id in ids) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences("ob_widget_prefs", Context.MODE_PRIVATE)
            val configStr = prefs.getString("active_config", null) ?: return
            
            val views = RemoteViews(context.packageName, R.layout.ob_app_widget)

            try {
                val config = JSONObject(configStr)
                views.setTextViewText(R.id.widget_title, config.optString("title", "Trending Tonight"))
                views.setTextViewText(R.id.widget_description, config.optString("description", "Discover what Nairobi is drinking right now."))
                views.setTextViewText(R.id.widget_button, config.optString("cta_label", "EXPLORE"))
                
                // Deep Link Handling
                val deepLink = config.optString("deep_link", "onbar://shop")
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                val pendingIntent = PendingIntent.getActivity(context, appWidgetId, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                views.setOnClickPendingIntent(R.id.widget_button, pendingIntent)
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

                // Note: Image loading via Thread in updateAppWidget is unstable. 
                // In a production app, we would use a WorkManager task to fetch the image and update the widget.
                // For now, ensuring it at least handles basic errors and doesn't leak.
                val imageUrl = config.optString("image_url", "")
                if (imageUrl.isNotEmpty()) {
                    Thread {
                        try {
                            val url = URL(imageUrl)
                            val bitmap = BitmapFactory.decodeStream(url.openConnection().getInputStream())
                            if (bitmap != null) {
                                views.setImageViewBitmap(R.id.widget_image, bitmap)
                                appWidgetManager.updateAppWidget(appWidgetId, views)
                            }
                        } catch (e: Exception) {
                            Log.e("WIDGET", "Image load failed", e)
                        }
                    }.start()
                }
            } catch (e: Exception) {
                Log.e("WIDGET", "Widget update failed", e)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
