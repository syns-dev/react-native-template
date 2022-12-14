import React from "react";
import PhoneInput from "react-native-phone-number-input";
import { View, StyleSheet, StatusBar, ImageBackground, BackHandler } from 'react-native';
import { withTheme, Card, Button, Text, Paragraph, HelperText } from "react-native-paper";
import DialogModal from "../../components/DialogModal";
import Constants from 'expo-constants';
import { LoginScreenState } from "../../interfaces/AuthInterface";
import { ScreenProps } from "../../interfaces/ScreenPropsInterface";
import appTheme from "../../theme/appTheme";
import AuthService from "../../services/AuthService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types/RootStackParamList";
import ScreenNavBar from "../../components/ScreenNavBar";
import { withUseTranslation } from "../../hoc/withUseTranslation";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

class LoginScreen extends React.Component<LoginScreenProps & ScreenProps, LoginScreenState>{

    public state: Readonly<LoginScreenState>;
    private authService: AuthService;

    constructor(props: LoginScreenProps & ScreenProps){
        super(props);

        this.state = {
            phone: '',
            isLoading: false,
            errorMessage: "",
            isConfirmDialogVisible: false
        };

        this.authService = new AuthService();
    }

    handleSubmit = async () => {

        this.setState({ isConfirmDialogVisible: false });

        let { phone } = this.state;
        phone = phone.replace('+', '');

        if(phone.trim()){

            this.setState({ isLoading: true });

            const response: {status: boolean} | any = await this.authService.requestForOTP(phone);

            if(response.status !== undefined && response.status == true){

                this.props.navigation.navigate("OTPVerificationScreen", {phone: phone});

                return null;
            }

            this.setState({ isLoading: false });

            this.props.navigation.navigate("RegisterScreen", {phone: phone});

            return null;

        }

        const { translation } = this.props;

        phone == '' && this.setState({ errorMessage: `${ translation?.t('auth.checkPhone') }!` });

    }

    onBackHandler = () => {
        BackHandler.exitApp();
        return true;
    }

    componentDidMount(){
        // this.backHandler = BackHandler.addEventListener(
        //     "hardwareBackPress",
        //     this.onBackHandler
        // );
    }

    componentWillUnmount() {
        //this.backHandler.remove();
    }

    render(){

        const { theme, navigation, translation } = this.props;

        return(
            <View style={styles(theme).container}>
                <StatusBar backgroundColor={theme.colors.primary} /> 
                
                <Card style={styles(theme).card}>
                    <ImageBackground 
                        source={!theme.dark ? require('../../../assets/images/bg/onboarding.jpg') : require('../../../assets/images/bg/onboarding.jpg')}
                        style={{ width: "100%", height: "106%" }}>

                        <ScreenNavBar screenName="login" navigation={navigation} icon="login" />
                        
                        <View style={{ padding: 13 }}>
                            <PhoneInput 
                                defaultValue={this.state.phone}
                                defaultCode="CD"
                                placeholder={`${translation?.t('messages.phone')}`}
                                containerStyle={{ width: "100%" }}
                                onChangeFormattedText={ (value: string) => this.setState({ phone: value }) }
                                withShadow
                                withDarkTheme={true}
                            />
                            <HelperText type="error" visible={true}>{this.state.errorMessage}</HelperText>
                            <Text></Text>
                            <View>
                                <Text></Text>
                                <Button
                                    icon="login" 
                                    mode="contained"
                                    style={{ marginTop: -25, padding: 6,backgroundColor:theme.colors.primary }} 
                                    labelStyle={{color: "#fff"}}
                                    loading={this.state.isLoading}
                                    disabled={this.state.phone == null && true}
                                    onPress={() => this.setState({ isConfirmDialogVisible: true })}>
                                    { translation?.t('messages.authenticate') }

                                </Button>
                            </View>
                        </View>
                        <DialogModal 
                            title={`${ translation?.t('messages.confirmation') }`}
                            content={<Paragraph>{this.state.phone}: { translation?.t('auth.confirmPhone') }?</Paragraph>} 
                            isVisible={this.state.isConfirmDialogVisible}
                            onConfirm={ this.handleSubmit }
                            onCancel={ () => this.setState({ isConfirmDialogVisible: false }) } 
                        />
                    </ImageBackground>
                </Card>
            </View>
        );
    }
}

const styles = (theme: ReturnType<typeof appTheme>) => StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: theme.colors.primary,
    },
    card: {
        borderBottomLeftRadius: 22, 
        borderBottomRightRadius: 22,
        height: "93%",
        overflow: 'hidden',
        marginTop: Constants.statusBarHeight
    },
    header: {
        width: "100%",
        height: 80,
        backgroundColor: theme.colors.primary,
        flexDirection: "row",
    },
});


export default (withTheme(withUseTranslation(LoginScreen)));