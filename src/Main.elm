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
    , bidId : String
    , currentBidValue : Float
    , increaseBidValue : Float
    , currency : String
    , currentBidPosition : Int
    , totalBidPosition : Int
    , minBid : Float
    }


type State
    = Loading
    | InMoney
    | OutOfMoney
    | IncreaseBid
    | Refunded


modelDecoder : D.Decoder Model
modelDecoder =
    D.map8 Model
        stateDecoder
        (D.at [ "context", "bidId" ] D.string)
        (D.at [ "context", "currentBidValue" ] D.float)
        (D.at [ "context", "increaseBidValue" ] D.float)
        (D.at [ "context", "currency" ] D.string)
        (D.at [ "context", "currentBidPosition" ] D.int)
        (D.at [ "context", "totalBidPosition" ] D.int)
        (D.at [ "context", "minBid" ] D.float)


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "Loading" ->
                        D.succeed Loading

                    "InMoney" ->
                        D.succeed InMoney

                    "OutOfMoney" ->
                        D.succeed OutOfMoney

                    "IncreaseBid" ->
                        D.succeed IncreaseBid

                    "Refunded" ->
                        D.succeed Refunded

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


type Msg
    = StateChanged Model
    | DecodeStateError D.Error
    | IncreaseClicked
    | ValueChanged String
    | RefundClicked
    | BidPositionChanged Int
    | UpdateConditionClicked


init : () -> ( Model, Cmd Msg )
init _ =
    ( { state = Loading
      , bidId = ""
      , currentBidValue = 0.0
      , increaseBidValue = 0.0
      , currency = ""
      , currentBidPosition = 0
      , totalBidPosition = 0
      , minBid = 0.0
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( m, Cmd.none )

        BidPositionChanged position ->
            ( { model | currentBidPosition = position }, Cmd.none )

        IncreaseClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "BID.INCREASE_BID" )
                    ]
                )
            )

        RefundClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "BID.REFUND" )
                    ]
                )
            )

        ValueChanged t ->
            let
                increaseBidValue =
                    Maybe.withDefault 0 (String.toFloat t)
            in
            ( { model | increaseBidValue = increaseBidValue }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "BID.UPDATE_INCREASE_BID_VALUE" )
                    , ( "newBidValue", E.float increaseBidValue )
                    ]
                )
            )

        UpdateConditionClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "BID.BID_POSITON_CHANGE" )
                    , ( "position", E.int 1 )
                    ]
                )
            )

        _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ case model.state of
            Loading ->
                div [] [ text "State: Loading" ]

            IncreaseBid ->
                div [] [ text "State: IncreaseBid" ]

            Refunded ->
                div [] [ text "State: Refunded" ]

            InMoney ->
                div [] [ text "State: InMoney" ]

            OutOfMoney ->
                div [] [ text "State: OutOfMoney" ]
        , viewBidDetail model
        , viewBidOption model
        , viewSpecialButton
        ]


viewBidDetail : Model -> Html Msg
viewBidDetail model =
    div []
        [ div []
            [ p []
                [ span [] [ text "You current bid: " ]
                , span [] [ text (toString model.currentBidValue) ]
                , span [] [ text model.currency ]
                , case model.state of
                    InMoney ->
                        div [ Attr.style "color" "green" ] [ text "You are In the money !" ]

                    OutOfMoney ->
                        div [ Attr.style "color" "red" ] [ text "You are Out of the money!" ]

                    _ ->
                        div [] []
                ]
            ]
        , div []
            [ p []
                [ span [] [ text "Yout bid position: " ]
                , span [] [ text (toString model.currentBidPosition) ]
                , span [] [ text "/" ]
                , span [] [ text (toString model.totalBidPosition) ]
                ]
            ]
        ]


viewBidOption : Model -> Html Msg
viewBidOption model =
    let
        isBidable =
            model.increaseBidValue >= model.minBid
    in
    div []
        [ span [] [ text "min bid: " ]
        , span [] [ text (toString model.minBid) ]
        , p [ Attr.style "margin-right" "1rem" ] [ text "Increase this bid by" ]
        , input
            [ Attr.type_ "text"
            , Attr.style "margin-right" "1rem"
            , onInput ValueChanged
            , Attr.value (toString model.increaseBidValue)
            , Attr.disabled (List.member model.state [ Refunded, IncreaseBid ])
            ]
            []
        , div [ Attr.style "margin-top" "1rem" ]
            [ button
                [ Attr.style "margin-right" "1rem"
                , Attr.disabled (List.member model.state [ Refunded, IncreaseBid ] || not isBidable)
                , onClick IncreaseClicked
                ]
                [ text "Increase this bid" ]
            , button
                [ Attr.hidden (not (List.member model.state [ OutOfMoney ]))
                , Attr.disabled (List.member model.state [ Refunded, IncreaseBid ])
                , onClick RefundClicked
                ]
                [ text "Refund" ]
            ]
        ]


viewSpecialButton : Html Msg
viewSpecialButton =
    button
        [ Attr.style "margin-top" "1rem"
        , Attr.style "background-color" "teal"
        , Attr.style "color" "white"
        , onClick UpdateConditionClicked
        ]
        [ text "Update bid position "
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
