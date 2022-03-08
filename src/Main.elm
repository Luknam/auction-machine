module Main exposing (main)

import Browser
import Debug exposing (toString)
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick, onInput)
import Json.Decode as D
import Json.Encode as E
import MachineConnector


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { state : State
    , minimumOfferValue : Float
    , maximumOfferQuantity : Int
    , offerValue : Float
    , offerQuantity : Int
    }


type State
    = Idle
    | UnOfferable
    | Offerable
    | MakeOffer
    | DisplayResult


modelDecoder : D.Decoder Model
modelDecoder =
    D.map5 Model
        stateDecoder
        (D.at [ "context", "minimumOfferValue" ] D.float)
        (D.at [ "context", "maximumOfferQuantity" ] D.int)
        (D.at [ "context", "offerValue" ] D.float)
        (D.at [ "context", "offerQuantity" ] D.int)


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "Idle" ->
                        D.succeed Idle

                    "UnOfferable" ->
                        D.succeed UnOfferable

                    "Offerable" ->
                        D.succeed Offerable

                    "MakeOffer" ->
                        D.succeed MakeOffer

                    "DisplayResult" ->
                        D.succeed DisplayResult

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


type Msg
    = Ignore
    | StateChanged Model
    | DecodeStateError D.Error
    | OfferClicked
    | QuantityChanged String
    | ValueChanged String
    | UpdateConditionClicked


init : () -> ( Model, Cmd Msg )
init _ =
    ( { state = Idle
      , minimumOfferValue = 0.0
      , maximumOfferQuantity = 0
      , offerValue = 0.0
      , offerQuantity = 0
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( m, Cmd.none )

        QuantityChanged t ->
            ( { model | offerQuantity = Maybe.withDefault 0 (String.toInt t) }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "OFFER.ADD_OFFER_DETAIL" )
                    , ( "offerQuantity", E.int (Maybe.withDefault 0 (String.toInt t)) )
                    , ( "offerValue", E.float model.offerValue )
                    ]
                )
            )

        UpdateConditionClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "OFFER.LOWEST_BID_CHANGED" )
                    , ( "minimumOfferValue", E.float 10.0 )
                    ]
                )
            )

        ValueChanged t ->
            ( { model | offerValue = Maybe.withDefault 0 (String.toFloat t) }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "OFFER.ADD_OFFER_DETAIL" )
                    , ( "offerQuantity", E.int model.offerQuantity )
                    , ( "offerValue", E.float (Maybe.withDefault 0 (String.toFloat t)) )
                    ]
                )
            )

        OfferClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "OFFER.MAKE_OFFERED" )
                    ]
                )
            )

        _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ case model.state of
            Idle ->
                div [] [ text "Im idle?" ]

            Offerable ->
                div [] [ text "Im offerable" ]

            UnOfferable ->
                div [] [ text "Im unofferable" ]

            MakeOffer ->
                div [] [ text "Im make offer" ]

            _ ->
                div [] [ text "Dont know" ]
        , viewAuctionDetail model
        , viewOfferForm model
        , viewSpecialButton
        ]


viewAuctionDetail : Model -> Html Msg
viewAuctionDetail model =
    div []
        [ p [] [ span [] [ text "Maximum offer quantity" ], span [] [ text (toString model.maximumOfferQuantity) ] ]
        , p [] [ span [] [ text "Minimum offer value" ], span [] [ text (toString model.minimumOfferValue) ] ]
        ]


viewOfferForm : Model -> Html Msg
viewOfferForm model =
    div []
        [ p [] [ text "offer quantity" ]
        , input
            [ Attr.type_ "text"
            , onInput QuantityChanged
            , Attr.value (toString model.offerQuantity)
            , Attr.disabled (List.member model.state [ MakeOffer ])
            ]
            []
        , div []
            [ p [] [ text "offer value" ]
            , input
                [ Attr.type_ "text"
                , onInput ValueChanged
                , Attr.value (toString model.offerValue)
                , Attr.disabled (List.member model.state [ MakeOffer ])
                ]
                []
            ]
        , button
            [ Attr.disabled (List.member model.state [ UnOfferable, MakeOffer ])
            , onClick OfferClicked
            ]
            [ text
                (case model.state of
                    MakeOffer ->
                        "...Make Offer..."

                    _ ->
                        "Make Offer"
                )
            ]
        ]


viewSpecialButton : Html Msg
viewSpecialButton =
    button
        [ onClick UpdateConditionClicked
        ]
        [ text "Update condition"
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    MachineConnector.stateChanged
        (\value ->
            case D.decodeValue modelDecoder value of
                Ok m ->
                    StateChanged m

                Err e ->
                    DecodeStateError e
        )
