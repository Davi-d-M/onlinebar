package com.example.theapp

import android.content.Context
import android.content.Intent
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class WidgetUpdateWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): androidx.work.ListenableWorker.Result {
        val client = OkHttpClient()
        val request = Request.Builder()
            .url("https://onlinebar-os.onrender.com/api/mobile/widget-config")
            .build()

        return try {
            val response = client.newCall(request).execute()
            val jsonStr = response.body?.string()
            
            if (jsonStr != null) {
                val prefs = applicationContext.getSharedPreferences("ob_widget_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("active_config", jsonStr).apply()
                
                // Trigger refresh on the UI
                val intent = Intent(applicationContext, OnlineBarWidgetProvider::class.java).apply {
                    action = "com.example.theapp.ACTION_WIDGET_REFRESH"
                }
                applicationContext.sendBroadcast(intent)
                
                androidx.work.ListenableWorker.Result.success()
            } else {
                androidx.work.ListenableWorker.Result.retry()
            }
        } catch (e: IOException) {
            androidx.work.ListenableWorker.Result.retry()
        }
    }
}
