package com.example.theapp

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

class LocationService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val client = OkHttpClient()
    private val mediaType = "application/json; charset=utf-8".toMediaType()
    private var isUpdating = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    syncLocationToGrid(location)
                }
            }
        }
    }

    private fun syncLocationToGrid(location: android.location.Location) {
        val prefs = getSharedPreferences("online_bar_rider", Context.MODE_PRIVATE)
        val phone = prefs.getString("rider_phone", null)
        val token = prefs.getString("rider_session_token", null)

        if (phone == null || token == null) {
            Log.w("BAR_GPS", "Telemetry aborted: No active session.")
            return
        }

        val payload = JSONObject().apply {
            put("phone", phone)
            put("token", token)
            put("lat", location.latitude)
            put("lng", location.longitude)
            put("accuracy", location.accuracy)
            put("speed", location.speed)
            put("heading", location.bearing)
            put("battery", getBatteryLevel())
        }

        val request = Request.Builder()
            .url("https://onlinebar.co.ke/api/rider/sync-location")
            .post(payload.toString().toRequestBody(mediaType))
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                Log.e("BAR_GPS", "Uplink Failed: ${e.message}")
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                if (response.isSuccessful) {
                    Log.i("BAR_GPS", "Telemetry Transmitted. Lat: ${location.latitude}")
                }
                response.close()
            }
        })
    }

    private fun getBatteryLevel(): Int {
        val bm = getSystemService(Context.BATTERY_SERVICE) as android.os.BatteryManager
        return bm.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, "BAR_LOCATION")
            .setContentTitle("Online Bar Runner")
            .setContentText("Live Delivery Synchronization Active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(1, notification)
        requestLocationUpdates()

        return START_STICKY
    }

    private fun requestLocationUpdates() {
        if (isUpdating) return

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e("BAR_GPS", "Location permission missing. Telemetry halted.")
            stopSelf()
            return
        }

        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, TimeUnit.SECONDS.toMillis(60))
            .setMinUpdateIntervalMillis(TimeUnit.SECONDS.toMillis(30))
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
            isUpdating = true
        } catch (unlikely: SecurityException) {
            Log.e("BAR_GPS", "Lost location permission. Could not request updates.")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "BAR_LOCATION",
                "Runner Tracking Hub",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        if (isUpdating) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            isUpdating = false
        }
    }
}
