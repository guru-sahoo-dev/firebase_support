// ----------------- Vesion ------------------

// react-native - version : "0.66.1",
// react-native-firebase/app: "^17.5.0",
// react-native-firebase/dynamic-links: "^17.2.0",
// react-native-firebase/messaging: "^16.7.0",
// ------------------------------------------

import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  useColorScheme,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  StatusBar,
} from "react-native";

import messaging from "@react-native-firebase/messaging";

import dynamicLinks from "@react-native-firebase/dynamic-links";

const App = () => {
  const getToken = async () => {
    const token = await messaging().getToken();
    // console.log('token--->', token);
    // Alert.alert(token);
    const smallIcon =
      Platform.OS === "android"
        ? "ic_notification" // Replace with the actual drawable resource name for Android
        : "ic_notification";
    const largeIcon =
      Platform.OS === "android"
        ? "ic_notification" // Replace with the actual drawable resource name for Android
        : "ic_notification";
    // storeage.storeValue('fcm_token', token, smallIcon, largeIcon);

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      messaging().sendMessage({
        to: token,
        notification: {
          android: {
            // smallIcon: smallIcon,
            largeIcon: largeIcon,
          },
        },
      });
      // console.log('Authorization status:', authStatus);
    }
  };
  const showNotification = () => {};

  useEffect(() => {
    const linkingEvent = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    return () => {
      linkingEvent.remove();
    };
  });
  const handleDeepLink = ({ url }) => {
    // console.log(url.split('?')[0], 'linkoyp');
    if (url.split("?")[0] == "thinkzoneotpless://otpless") {
      // console.log(url, 'url matched app');
      let phone = url.split("=")[1];
      //  console.log('phone----->', phone);
      const data = {
        loginType: "whatsapp",
        whatsappId: phone,
      };
      console.log("data---->", data);
      store.dispatch(types.loadUserStartbyphone(data));
      //ToastAndroid.show('Authenticate Successfully !', ToastAndroid.SHORT);
    }
    // console.log(url, 'url app');

    // Api.post(`otpless_auth_new/${url.split('=')[1]}`).then(response => {
    //   console.log(response.data, 'otp response');
    // });
  };

  const buildLink = async () => {
    const link = await dynamicLinks().buildLink({
      link: "https://thinkzone.in/offer",
      // domainUriPrefix is created in your Firebase console
      domainUriPrefix: "https://thinkzoneapp.page.link",
      // optional setup which updates Firebase analytics campaign
      // "banner". This also needs setting up beforehand
      analytics: {
        campaign: "banner",
      },
    });
    return link;
  };
  useEffect(() => {
    buildLink();

    getToken();

    SplashScreen.hide();
    store.dispatch(types.getUserstorestart());
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      messaging().sendMessage({
        to: token,
        notification: {
          android: {
            // smallIcon: smallIcon,
            // largeIcon: largeIcon,
          },
        },
      });
      console.log("Authorization Status", authStatus);
    }
    showNotification();
  };

  useEffect(() => {
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          // console.log('token------------------->', token);
        });
    } else {
      console.log("Failed token status : ", authStatus);
    }

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      // navigation.navigate(remoteMessage.data.navigateto);
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // Alert.alert('notification', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <StatusBar
        backgroundColor="#0060ca" // You can customize the background color
        barStyle="light-content" // You can set it to 'dark-content' as well
      />
      <ReduxNetworkProvider>
        <NetworkProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </NetworkProvider>
      </ReduxNetworkProvider>
      <FlashMessage position="top" />
    </Provider>
  );
};

const styles = StyleSheet.create({
  // safeview: {
  //   flex: 0,
  //   backgroundColor: Color.primary,
  //   // paddingTop: Platform.OS === 'android' ? 25 : 0,
  // },
});
export default App;
