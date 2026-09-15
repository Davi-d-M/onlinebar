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
import android.widget.RemoteViews
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.net.URL

class OnlineBarWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // Trigger remote sync
        syncWidgetConfig(context)
        
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

    private fun syncWidgetConfig(context: Context) {
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("https://onlinebar-os.onrender.com/api/mobile/widget-config")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {}
            override fun onResponse(call: Call, response: Response) {
                val jsonStr = response.body?.string()
                if (jsonStr != null) {
                    val prefs = context.getSharedPreferences("ob_widget_prefs", Context.MODE_PRIVATE)
                    prefs.edit().putString("active_config", jsonStr).apply()
                    
                    // Trigger a refresh after sync
                    val refreshIntent = Intent(context, OnlineBarWidgetProvider::class.java).apply {
                        action = "com.example.theapp.ACTION_WIDGET_REFRESH"
                    }
                    context.sendBroadcast(refreshIntent)
                }
            }
        })
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences("ob_widget_prefs", Context.MODE_PRIVATE)
            val configStr = prefs.getString("active_config", null)
            
            val views = RemoteViews(context.packageName, R.layout.ob_app_widget)

            if (configStr != null) {
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

                    // Image Loading (Async-ish)
                    val imageUrl = config.optString("image_url", "")
                    if (imageUrl.isNotEmpty()) {
                        // Note: For production, use a proper background worker or image library
                        Thread {
                            try {
                                val url = URL(imageUrl)
                                val bitmap = BitmapFactory.decodeStream(url.openConnection().getInputStream())
                                views.setImageViewBitmap(R.id.widget_image, bitmap)
                                appWidgetManager.updateAppWidget(appWidgetId, views)
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                        }.start()
                    }

                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
